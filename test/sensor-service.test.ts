import type { SensorAdminServerMessage } from '../shared/sensor-config';
import type { ColumnId, PublishedColumn } from '../shared/wall';
import { describe, expect, it } from 'vitest';
import { parseSensorMessage } from '~/utils/sensor-message';
import { SensorService } from '../sensor-service/service';
import { DEMO_RIG, renderScan, wallToSensor } from '../sensor-service/synthetic';
import { scanToPoints } from '../sensor-service/tracker';
import { createOscBundle, createOscMessage, parseOscPacket } from '../shared/osc';
import { DEFAULT_CALIBRATION_WALL_POINTS, DEFAULT_SENSOR_CONFIG } from '../shared/sensor-config';
import { COLUMN_IDS } from '../shared/wall';

const idle: PublishedColumn = { phase: 'idle', locale: 'id', subItem: '', photo: 0, page: 0, photoCount: 2, pageCount: 2 };
const columns = Object.fromEntries(COLUMN_IDS.map(id => [id, idle])) as Record<ColumnId, PublishedColumn>;

function setup(config: unknown = DEFAULT_SENSOR_CONFIG) {
  let clock = 0;
  const saved: unknown[] = [];
  const service = new SensorService({ config: config as typeof DEFAULT_SENSOR_CONFIG, now: () => clock, saveConfig: next => void saved.push(next) });
  const client = () => {
    const frames: string[] = [];
    return { frames, send: (data: string) => void frames.push(data) };
  };
  const wall = client();
  const admin = client();
  service.addClient(wall);
  service.addClient(admin);
  service.handleMessage(wall, JSON.stringify({ version: 2, type: 'clientHello', layoutVersion: 'wall-v5', columns, hold: { card: { enabled: true, seconds: 1 } } }));
  service.handleMessage(admin, JSON.stringify({ version: 2, type: 'adminHello' }));
  const parsed = () => wall.frames.map(frame => parseSensorMessage(frame));
  const adminMessages = () => admin.frames.map(frame => JSON.parse(frame) as SensorAdminServerMessage);
  return { service, wall, admin, parsed, adminMessages, saved, at: (ms: number) => void (clock = ms) };
}

function tuioFrame(cursors: [number, number, number][], fseq: number) {
  return parseOscPacket(createOscBundle([
    createOscMessage('/tuio/2Dcur', ['alive', ...cursors.map(([id]) => id)]),
    ...cursors.map(([id, x, y]) => createOscMessage('/tuio/2Dcur', ['set', id, { float: x / 2304 }, { float: y / 1344 }, { float: 0 }, { float: 0 }, { float: 0 }])),
    createOscMessage('/tuio/2Dcur', ['fseq', fseq]),
  ]));
}

describe('sensor Service protocol v2', () => {
  it('greets the wall with frames the renderer accepts and keeps sequence order', () => {
    const { service, parsed } = setup();
    service.heartbeat();
    const results = parsed();
    expect(results.every(result => result.ok)).toBe(true);
    const messages = results.map(result => result.ok ? result.message : null);
    expect(messages[0]).toMatchObject({ type: 'hello', sensorReady: true, calibrated: true, layoutVersion: 'wall-v5' });
    expect(messages.map(message => message!.seq)).toEqual([...messages.map(message => message!.seq)].sort((a, b) => a - b));
    expect(new Set(messages.map(message => message!.sessionId)).size).toBe(1);
  });

  it('keeps admin and wall traffic apart', () => {
    const { wall, adminMessages } = setup();
    expect(adminMessages()[0]).toMatchObject({ type: 'adminState', status: { source: 'off', wallClients: 1 } });
    expect(wall.frames.some(frame => frame.includes('admin'))).toBe(false);
  });

  it('applies a dashboard config, saves it, and reports the new source status', () => {
    const { service, admin, wall, saved, parsed, adminMessages } = setup();
    service.handleMessage(admin, JSON.stringify({ version: 2, type: 'setConfig', config: { ...DEFAULT_SENSOR_CONFIG, source: 'tuio', tuio: { port: 3333, invertY: true } } }));
    expect(saved).toHaveLength(1);
    expect(adminMessages().at(-1)).toEqual({ version: 2, type: 'adminResult', request: 'setConfig', ok: true });
    expect(service.config.tuio.invertY).toBe(true);
    const status = parsed().at(-1)!;
    expect(status.ok && status.message).toMatchObject({ type: 'status', sensorReady: false });
    // A wall may not change the config.
    service.handleMessage(wall, JSON.stringify({ version: 2, type: 'setConfig', config: DEFAULT_SENSOR_CONFIG }));
    expect(service.config.source).toBe('tuio');
  });

  it('turns a held TUIO cursor into one validated input and follows wall snapshots', () => {
    const { service, wall, parsed, at } = setup({ ...DEFAULT_SENSOR_CONFIG, source: 'tuio' });
    service.setSourceState(true);
    at(0);
    service.handleTuio(tuioFrame([[1, 212, 700]], 1));
    at(900);
    service.handleTuio(tuioFrame([[1, 213, 701]], 2));
    at(1_000);
    service.tick();
    at(1_500);
    service.handleTuio(tuioFrame([[1, 213, 701]], 3));
    const inputs = parsed().filter(result => result.ok && result.message.type === 'input');
    expect(inputs).toHaveLength(1);
    expect(inputs[0]!.ok && inputs[0]!.message).toMatchObject({ action: { type: 'main', columnId: 1 }, pointerId: 'tuio-1' });
    const first = inputs[0]!.ok && inputs[0]!.message.type === 'input' ? inputs[0]!.message : null;
    expect(Math.abs(first!.x - 213)).toBeLessThanOrEqual(1);
    expect(Math.abs(first!.y - 701)).toBeLessThanOrEqual(1);

    // Column 1 opened: its flags vanish, so a cursor on a former flag sends nothing.
    service.handleMessage(wall, JSON.stringify({ version: 2, type: 'clientState', layoutVersion: 'wall-v5', columns: { ...columns, 1: { ...idle, phase: 'active', photoCount: 1, pageCount: 1 } } }));
    at(2_000);
    service.handleTuio(tuioFrame([[2, 136, 1017]], 4));
    at(3_000);
    service.handleTuio(tuioFrame([[2, 136, 1017]], 5));
    expect(parsed().filter(result => result.ok && result.message.type === 'input')).toHaveLength(1);
  });

  it('suppresses touch input and reports calibrated=false during calibration', () => {
    const { service, admin, parsed, at } = setup({ ...DEFAULT_SENSOR_CONFIG, source: 'tuio' });
    service.setSourceState(true);
    service.handleMessage(admin, JSON.stringify({ version: 2, type: 'calibrate', on: true }));
    const status = parsed().at(-1)!;
    expect(status.ok && status.message).toMatchObject({ type: 'status', calibrated: false, detail: 'calibrating' });
    at(0);
    service.handleTuio(tuioFrame([[1, 212, 700]], 1));
    at(2_000);
    service.tick();
    expect(parsed().some(result => result.ok && result.message.type === 'input')).toBe(false);
  });

  it('keeps OSC show control working', () => {
    const { service, parsed } = setup();
    service.handleShowControl(parseOscPacket(createOscMessage('/altama/open', [2])));
    service.handleShowControl(parseOscPacket(createOscMessage('/altama/lang', [4, 'en'])));
    const actions = parsed().flatMap(result => result.ok && result.message.type === 'input' ? [result.message.action] : []);
    expect(actions).toEqual([{ type: 'subItem', columnId: 2, subItemId: 'tekiro' }, { type: 'language', columnId: 4, locale: 'en' }]);
  });

  it('drives the wall from synthetic UST-10LX scans after calibration and background capture', () => {
    const calibration = DEFAULT_CALIBRATION_WALL_POINTS.map(wall => ({ wall, sensor: wallToSensor(wall) }));
    const { service, admin, parsed, adminMessages, at } = setup({ ...DEFAULT_SENSOR_CONFIG, source: 'hokuyo', hokuyo: { ...DEFAULT_SENSOR_CONFIG.hokuyo, calibration } });
    service.setSourceState(true, '', 40);
    expect(service.calibrated).toBe(true);

    service.handleMessage(admin, JSON.stringify({ version: 2, type: 'captureBackground' }));
    for (let i = 0; i < 40; i++)
      service.handleScan(renderScan([], DEMO_RIG, 3), DEMO_RIG.params);
    expect(adminMessages().at(-1)).toMatchObject({ type: 'adminResult', request: 'captureBackground', ok: true });
    expect(service.status().backgroundSteps).toBeGreaterThan(1000);
    expect(scanToPoints(renderScan([]), DEMO_RIG.params, service.config.hokuyo)).not.toEqual([]);

    // Hold the Rexco tile (column 2) for ~1.2 s at 40 Hz.
    for (let t = 0; t <= 1_200; t += 25) {
      at(t);
      service.handleScan(renderScan([{ x: 588, y: 900 }], DEMO_RIG, 3), DEMO_RIG.params);
    }
    const inputs = parsed().flatMap(result => result.ok && result.message.type === 'input' ? [result.message] : []);
    expect(inputs).toHaveLength(1);
    expect(inputs[0]!.action).toEqual({ type: 'subItem', columnId: 2, subItemId: 'rexco' });
    expect(inputs[0]!.pointerId).toMatch(/^lidar-/);
  });
});
