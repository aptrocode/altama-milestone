import type { CloseButtonOptions } from '../shared/close-button';
import type { HoldSettings } from '../shared/hold-settings';
import type { LanguageBarMode } from '../shared/language-bar';
import type { OscMessage } from '../shared/osc';
import type { Point2, SensorAdminClientMessage, SensorAdminServerMessage, SensorConfig, SensorServiceStatus } from '../shared/sensor-config';
import type { ColumnId, ColumnSnapshot, PublishedColumn, WallAction, WallLocale } from '../shared/wall';
import type { Calibration } from './calibration';
import type { DwellInput } from './dwell';
import type { ScanParameters } from './scip';
import { DEFAULT_CLOSE_BUTTON } from '../shared/close-button';
import { DEFAULT_HOLD_SETTINGS, normalizeHoldSettings } from '../shared/hold-settings';
import { mergeSensorConfig, normalizeSensorConfig, SENSOR_ADMIN_VERSION } from '../shared/sensor-config';
import { SENSOR_LAYOUT_VERSION, visibleTargets } from '../shared/sensor-targets';
import { COLUMN_IDS, WALL_LOCALES } from '../shared/wall';
import { closeButtonOptions, normalizeWallSettings } from '../shared/wall-settings';
import { buildCalibration } from './calibration';
import { DwellEngine } from './dwell';
import { AugmentaReceiver, normalizedToWall, TuioReceiver } from './normalized';
import { PROTOCOL_VERSION, ProtocolWriter } from './protocol';
import { showControlInputs } from './show-control';
import { clusterPoints, clustersToWall, scanToPoints, Tracker } from './tracker';

/** Anything that can receive a text frame (a Bun WebSocket in production, an array in tests). */
export interface ServiceClient { send: (data: string) => void }

type Role = 'pending' | 'wall' | 'admin';

export interface SensorServiceOptions {
  config: SensorConfig;
  background?: number[] | null;
  saveConfig?: (config: SensorConfig) => void | Promise<void>;
  saveBackground?: (background: number[] | null) => void | Promise<void>;
  /** Called after a config change so transports can rebind ports or reconnect the LiDAR. */
  onConfig?: (next: SensorConfig, previous: SensorConfig) => void;
  writer?: ProtocolWriter;
  now?: () => number;
  log?: (text: string) => void;
}

const BACKGROUND_SCANS = 40;
const BACKGROUND_TIMEOUT_MS = 5_000;

interface WallState { columns: Partial<Record<ColumnId, PublishedColumn>>; hold: HoldSettings; cardOffsetY: number; showClose: boolean; close: CloseButtonOptions; showArrows: boolean; showPages: boolean; languageBar: LanguageBarMode }

/** Same wall action (type, column, and its locale / sub-item / page). */
function sameAction(a: WallAction, b: WallAction): boolean {
  const key = (action: WallAction) => JSON.stringify([
    action.type,
    action.columnId,
    'locale' in action ? action.locale : '',
    'subItemId' in action ? action.subItemId : '',
    'page' in action ? action.page : '',
  ]);
  return key(a) === key(b);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseColumns(value: unknown): Partial<Record<ColumnId, PublishedColumn>> {
  if (!isRecord(value))
    return {};
  const out: Partial<Record<ColumnId, PublishedColumn>> = {};
  for (const id of COLUMN_IDS) {
    const item = value[id];
    if (!isRecord(item) || (item.phase !== 'idle' && item.phase !== 'active'))
      continue;
    const count = (raw: unknown) => Number.isSafeInteger(raw) && (raw as number) >= 0 ? raw as number : 0;
    out[id] = {
      phase: item.phase,
      locale: WALL_LOCALES.includes(item.locale as WallLocale) ? item.locale as WallLocale : 'id',
      subItem: typeof item.subItem === 'string' ? item.subItem : '',
      photo: count(item.photo),
      page: count(item.page),
      photoCount: count(item.photoCount),
      pageCount: count(item.pageCount),
    };
  }
  return out;
}

/**
 * Sensor Service core, independent of sockets: wall protocol v2 (hello/status/heartbeat/input), the
 * /dashboard admin contract, the selected touch source, and OSC show control.
 */
export class SensorService {
  config: SensorConfig;
  private calibration: Calibration | null;
  private background: number[] | null;
  private readonly options: SensorServiceOptions;
  private readonly writer: ProtocolWriter;
  private readonly now: () => number;
  private readonly clients = new Map<ServiceClient, Role>();
  /**
   * Snapshots per connected wall, in connection order. The first (primary) wall defines the visible
   * targets and receives touch input, so a second renderer (a phone opening "/") cannot change what
   * the LED wall's contacts hit.
   */
  private readonly walls = new Map<ServiceClient, WallState>();
  private columns: Partial<Record<ColumnId, PublishedColumn>> = {};
  private hold: HoldSettings = normalizeHoldSettings(DEFAULT_HOLD_SETTINGS);
  private readonly engine: DwellEngine;
  private readonly tracker = new Tracker();
  private readonly augmenta = new AugmentaReceiver();
  private readonly tuio = new TuioReceiver();
  private sourceReady = false;
  private sourceDetail = '';
  private scanRate = 0;
  private calibrating = false;
  private sensorPoints: Point2[] = [];
  private capture: { scans: number; ranges: number[]; client: ServiceClient; startedAt: number } | null = null;
  private lastStatusKey = '';
  private inputs = 0;
  private lastInput = '';

  constructor(options: SensorServiceOptions) {
    this.options = options;
    this.config = normalizeSensorConfig(options.config);
    this.calibration = buildCalibration(this.config.hokuyo.calibration);
    this.background = options.background ?? null;
    this.writer = options.writer ?? new ProtocolWriter();
    this.now = options.now ?? (() => Date.now());
    this.engine = new DwellEngine({ onInput: input => this.sendInput(input) });
    this.sourceReady = this.config.source === 'off';
    this.lastStatusKey = this.statusKey();
  }

  // ---- derived state ------------------------------------------------------------------------

  get sensorReady(): boolean {
    return this.config.source === 'off' || this.sourceReady;
  }

  get calibrated(): boolean {
    if (this.calibrating)
      return false;
    return this.config.source !== 'hokuyo' || this.calibration !== null;
  }

  get detail(): string {
    if (this.calibrating)
      return 'calibrating';
    if (this.config.source === 'off')
      return 'osc only';
    if (this.config.source === 'hokuyo' && this.sourceReady && !this.calibration)
      return 'hokuyo not calibrated';
    return this.sourceDetail;
  }

  status(): SensorServiceStatus {
    return {
      source: this.config.source,
      sensorReady: this.sensorReady,
      calibrated: this.calibrated,
      calibrating: this.calibrating,
      detail: this.detail,
      wallClients: [...this.clients.values()].filter(role => role === 'wall').length,
      hold: this.hold,
      calibrationRmsPx: this.calibration ? Math.round(this.calibration.rmsPx * 10) / 10 : null,
      backgroundSteps: this.background?.filter(value => value > 0).length ?? 0,
      scanRate: this.config.source === 'hokuyo' ? this.scanRate : 0,
      inputs: this.inputs,
      lastInput: this.lastInput,
    };
  }

  private statusKey() {
    return `${this.sensorReady}|${this.calibrated}|${this.detail}`;
  }

  // ---- clients ------------------------------------------------------------------------------

  addClient(client: ServiceClient) {
    this.clients.set(client, 'pending');
  }

  removeClient(client: ServiceClient) {
    const role = this.clients.get(client);
    this.clients.delete(client);
    if (this.capture?.client === client)
      this.capture = null;
    if (role === 'wall') {
      const wasPrimary = this.primaryWall === client;
      this.walls.delete(client);
      if (wasPrimary)
        this.applyPrimaryWall();
      this.broadcastAdminState();
    }
  }

  private get primaryWall(): ServiceClient | undefined {
    return this.walls.keys().next().value;
  }

  /** Targets and hold rules follow the primary wall; none while no wall is connected. */
  private applyPrimaryWall() {
    const primary = this.primaryWall;
    const state = primary ? this.walls.get(primary)! : null;
    this.columns = state?.columns ?? {};
    this.hold = state?.hold ?? normalizeHoldSettings(DEFAULT_HOLD_SETTINGS);
    this.engine.setHold(this.hold);
    this.engine.setTargets(visibleTargets(this.columns, {
      offsetY: state?.cardOffsetY ?? 0,
      showClose: state?.showClose ?? true,
      showArrows: state?.showArrows ?? true,
      showPages: state?.showPages ?? true,
      languageBar: state?.languageBar ?? 'compact',
      close: state?.close,
    }), this.now());
  }

  private send(client: ServiceClient, data: string) {
    try {
      client.send(data);
    }
    catch (error) {
      this.options.log?.(`[WS] send failed: ${String(error)}`);
    }
  }

  private broadcast(role: Role, data: string) {
    for (const [client, clientRole] of this.clients) {
      if (clientRole === role)
        this.send(client, data);
    }
  }

  private sendAdmin(client: ServiceClient, message: SensorAdminServerMessage) {
    this.send(client, JSON.stringify(message));
  }

  private broadcastAdminState() {
    const message: SensorAdminServerMessage = { version: SENSOR_ADMIN_VERSION, type: 'adminState', config: this.config, status: this.status() };
    this.broadcast('admin', JSON.stringify(message));
  }

  /** Sends status to walls and admins when readiness, calibration, or detail changed. */
  private refreshStatus(force = false) {
    const key = this.statusKey();
    if (!force && key === this.lastStatusKey)
      return;
    this.lastStatusKey = key;
    this.broadcast('wall', this.writer.status(this.sensorReady, this.calibrated, this.detail));
    this.broadcastAdminState();
  }

  handleMessage(client: ServiceClient, raw: string) {
    let data: unknown;
    try {
      data = JSON.parse(raw);
    }
    catch {
      this.options.log?.('[WS] ignored invalid JSON');
      return;
    }
    if (!isRecord(data) || data.version !== PROTOCOL_VERSION)
      return;
    const role = this.clients.get(client);
    if (role === undefined)
      return;

    if (data.type === 'clientHello' || data.type === 'clientState') {
      if (role === 'admin')
        return;
      if (data.layoutVersion !== SENSOR_LAYOUT_VERSION)
        this.options.log?.(`[WS] wall layout ${String(data.layoutVersion)} differs from ${SENSOR_LAYOUT_VERSION}`);
      const isHello = data.type === 'clientHello' && role === 'pending';
      if (!isHello && role !== 'wall')
        return;
      const previous = this.walls.get(client);
      const state: WallState = {
        columns: { ...previous?.columns, ...parseColumns(data.columns) },
        hold: data.hold !== undefined ? normalizeHoldSettings(data.hold) : previous?.hold ?? normalizeHoldSettings(DEFAULT_HOLD_SETTINGS),
        cardOffsetY: data.cardOffsetY !== undefined ? normalizeWallSettings({ cardOffsetY: data.cardOffsetY }).cardOffsetY : previous?.cardOffsetY ?? 0,
        showClose: typeof data.showClose === 'boolean' ? data.showClose : previous?.showClose ?? true,
        showArrows: typeof data.showArrows === 'boolean' ? data.showArrows : previous?.showArrows ?? true,
        showPages: typeof data.showPages === 'boolean' ? data.showPages : previous?.showPages ?? true,
        close: data.closeScale !== undefined || data.closeOffsetX !== undefined || data.closeOffsetY !== undefined
          ? closeButtonOptions(normalizeWallSettings({ closeScale: data.closeScale, closeOffsetX: data.closeOffsetX, closeOffsetY: data.closeOffsetY }))
          : previous?.close ?? DEFAULT_CLOSE_BUTTON,
        languageBar: data.languageBar !== undefined ? normalizeWallSettings({ languageBar: data.languageBar }).languageBar : previous?.languageBar ?? 'compact',
      };
      this.walls.set(client, state);
      if (this.primaryWall === client)
        this.applyPrimaryWall();
      if (isHello) {
        this.clients.set(client, 'wall');
        this.send(client, this.writer.hello(this.sensorReady, this.calibrated));
        if (this.detail)
          this.send(client, this.writer.status(this.sensorReady, this.calibrated, this.detail));
        this.options.log?.(`[WS] wall connected${this.primaryWall === client ? '' : ' (secondary: no touch input)'}`);
        this.broadcastAdminState();
      }
      else if (data.hold !== undefined && this.primaryWall === client) {
        this.broadcastAdminState();
      }
      return;
    }

    if (data.type === 'adminHello') {
      if (role === 'wall')
        return;
      this.clients.set(client, 'admin');
      this.sendAdmin(client, { version: SENSOR_ADMIN_VERSION, type: 'adminState', config: this.config, status: this.status() });
      return;
    }
    if (role === 'admin')
      this.handleAdmin(client, data as unknown as SensorAdminClientMessage);
  }

  private handleAdmin(client: ServiceClient, message: SensorAdminClientMessage) {
    const reply = (ok: boolean, error?: string) => this.sendAdmin(client, { version: SENSOR_ADMIN_VERSION, type: 'adminResult', request: message.type, ok, ...(error ? { error } : {}) });
    switch (message.type) {
      case 'setConfig': {
        if (!isRecord(message.config))
          return reply(false, 'invalid config');
        const next = mergeSensorConfig(this.config, message.config);
        const sourcePort = next.source === 'augmenta' ? next.augmenta.port : next.source === 'tuio' ? next.tuio.port : null;
        if (sourcePort === next.osc.port)
          return reply(false, `port ${sourcePort} dipakai OSC`);
        this.applyConfig(next);
        return reply(true);
      }
      case 'calibrate':
        this.setCalibrating(message.on === true);
        return reply(true);
      case 'captureBackground':
        if (this.config.source !== 'hokuyo' || !this.sourceReady)
          return reply(false, 'hokuyo not streaming');
        this.capture = { scans: 0, ranges: [], client, startedAt: this.now() };
        return;
      case 'clearBackground':
        this.setBackground(null);
        return reply(true);
      default:
        return reply(false, 'unknown request');
    }
  }

  applyConfig(value: unknown) {
    const previous = this.config;
    const next = normalizeSensorConfig(value);
    this.config = next;
    this.calibration = buildCalibration(next.hokuyo.calibration);
    if (next.source !== previous.source) {
      this.engine.clear();
      this.tracker.clear();
      this.augmenta.clear();
      this.tuio.clear();
      this.sensorPoints = [];
      this.failCapture('source changed');
      this.sourceReady = next.source === 'off';
      this.sourceDetail = '';
      this.scanRate = 0;
    }
    void Promise.resolve(this.options.saveConfig?.(next)).catch(error => this.options.log?.(`[Config] save failed: ${String(error)}`));
    this.options.onConfig?.(next, previous);
    this.options.log?.(`[Config] source=${next.source}${this.calibration ? ` calibration rms=${this.calibration.rmsPx.toFixed(1)}px` : ''}`);
    this.refreshStatus(true);
  }

  setCalibrating(on: boolean) {
    this.calibrating = on;
    this.engine.suppressed = on;
    this.refreshStatus();
  }

  /** Ends a pending background capture with an error reply so the dashboard is never left waiting. */
  private failCapture(error: string) {
    const capture = this.capture;
    this.capture = null;
    if (capture)
      this.sendAdmin(capture.client, { version: SENSOR_ADMIN_VERSION, type: 'adminResult', request: 'captureBackground', ok: false, error });
  }

  private setBackground(background: number[] | null) {
    this.background = background;
    void Promise.resolve(this.options.saveBackground?.(background)).catch(error => this.options.log?.(`[Background] save failed: ${String(error)}`));
    this.broadcastAdminState();
  }

  // ---- sources ------------------------------------------------------------------------------

  /** Transport readiness of the selected source (LiDAR streaming, UDP port bound). */
  setSourceState(ready: boolean, detail = '', scanRate = this.scanRate) {
    const changedRate = scanRate !== this.scanRate;
    this.sourceReady = ready;
    this.sourceDetail = detail;
    this.scanRate = scanRate;
    if (!ready) {
      this.engine.update([], this.now());
      this.tracker.clear();
      this.sensorPoints = [];
      this.failCapture('hokuyo offline');
    }
    const before = this.lastStatusKey;
    this.refreshStatus();
    if (changedRate && before === this.lastStatusKey)
      this.broadcastAdminState();
  }

  handleScan(ranges: number[], params: ScanParameters) {
    if (this.config.source !== 'hokuyo')
      return;
    const now = this.now();
    const hokuyo = this.config.hokuyo;
    if (this.capture)
      this.collectBackground(ranges, params);
    const clusters = clusterPoints(scanToPoints(ranges, params, hokuyo, this.background), hokuyo);
    this.sensorPoints = clusters.slice(0, 8).map(cluster => ({ x: Math.round(cluster.center.x), y: Math.round(cluster.center.y) }));
    const contacts = this.calibration ? this.tracker.update(clustersToWall(clusters, this.calibration), now) : [];
    this.engine.update(contacts, now);
  }

  private collectBackground(ranges: number[], params: ScanParameters) {
    const capture = this.capture!;
    const min = this.config.hokuyo.minRangeMm;
    ranges.forEach((range, index) => {
      const step = params.amin + index;
      if (range >= min && (!capture.ranges[step] || range < capture.ranges[step]!))
        capture.ranges[step] = range;
    });
    capture.scans++;
    if (capture.scans < BACKGROUND_SCANS)
      return;
    const background = Array.from({ length: params.amax + 1 }, (_, step) => capture.ranges[step] ?? 0);
    this.capture = null;
    this.setBackground(background);
    this.sendAdmin(capture.client, { version: SENSOR_ADMIN_VERSION, type: 'adminResult', request: 'captureBackground', ok: true });
  }

  handleAugmenta(messages: OscMessage[]) {
    if (this.config.source !== 'augmenta')
      return;
    this.augmenta.handle(messages, this.now());
    this.feedNormalized();
  }

  handleTuio(messages: OscMessage[]) {
    if (this.config.source !== 'tuio')
      return;
    this.tuio.handle(messages, this.now());
    this.feedNormalized();
  }

  private feedNormalized() {
    const now = this.now();
    if (this.config.source === 'augmenta')
      this.engine.update(normalizedToWall(this.augmenta.contacts(now), this.config.augmenta), now);
    else if (this.config.source === 'tuio')
      this.engine.update(normalizedToWall(this.tuio.contacts(now), this.config.tuio), now);
  }

  /** /altama/* show control, independent of the touch source. */
  handleShowControl(messages: OscMessage[]) {
    const snapshots = Object.fromEntries(COLUMN_IDS.map(id => [id, this.columns[id] ?? { phase: 'idle', locale: 'id', subItem: '', photo: 0, page: 0 }])) as Record<ColumnId, ColumnSnapshot>;
    // Press each action where the wall draws it now (card offset, language bar, close button),
    // falling back to the layout point when the target is not on screen.
    const state = this.primaryWall ? this.walls.get(this.primaryWall) : undefined;
    const drawn = visibleTargets(this.columns, {
      offsetY: state?.cardOffsetY ?? 0,
      languageBar: state?.languageBar ?? 'compact',
      close: state?.close,
    });
    for (const input of showControlInputs(messages, snapshots)) {
      const target = drawn.find(item => sameAction(item.action, input.action));
      const x = target ? target.rect.x + target.rect.width / 2 : input.x;
      const y = target ? target.rect.y + target.rect.height / 2 : input.y;
      this.emitInput('osc-showcontrol', x, y, input.action);
    }
  }

  private sendInput(input: DwellInput) {
    this.emitInput(input.pointerId, input.x, input.y, input.target.action);
  }

  private emitInput(pointerId: string, x: number, y: number, action: DwellInput['target']['action']) {
    this.inputs++;
    this.lastInput = `${pointerId} ${JSON.stringify(action)}`;
    this.options.log?.(`[Input] ${this.lastInput} @ ${Math.floor(x)},${Math.floor(y)}`);
    const primary = this.primaryWall;
    if (primary)
      this.send(primary, this.writer.input(pointerId, x, y, action));
    this.broadcastAdminState();
  }

  // ---- timers -------------------------------------------------------------------------------

  /** ~30 ms: expires Augmenta/TUIO contacts and completes dwell between frames. */
  tick() {
    if (this.capture && this.now() - this.capture.startedAt > BACKGROUND_TIMEOUT_MS)
      this.failCapture('timeout');
    if (this.config.source === 'augmenta' || this.config.source === 'tuio')
      this.feedNormalized();
    else
      this.engine.tick(this.now());
  }

  /** Every 2 s to walls (docs/sensor.md). */
  heartbeat() {
    this.broadcast('wall', this.writer.heartbeat());
  }

  /** ~10 Hz contact preview for /dashboard. */
  publishContacts() {
    const message: SensorAdminServerMessage = { version: SENSOR_ADMIN_VERSION, type: 'adminContacts', contacts: this.engine.preview(this.now()), sensorPoints: this.config.source === 'hokuyo' ? this.sensorPoints : [] };
    this.broadcast('admin', JSON.stringify(message));
  }

  get hasAdmins() {
    return [...this.clients.values()].includes('admin');
  }
}
