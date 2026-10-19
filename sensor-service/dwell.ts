import type { HoldSettings } from '../shared/hold-settings';
import type { SensorAdminContact } from '../shared/sensor-config';
import type { SensorTarget } from '../shared/sensor-targets';
import { DEFAULT_HOLD_SETTINGS, normalizeHoldSettings } from '../shared/hold-settings';
import { hitTest } from '../shared/sensor-targets';

/** A tracked contact in logical wall px, reported every frame while present. */
export interface Contact { id: string; x: number; y: number }

export interface DwellInput { pointerId: string; target: SensorTarget; x: number; y: number }

export interface DwellOptions {
  /** Deliberate contact for language/Back and for hold groups that are off (docs/sensor.md: ~0.2–0.3 s). */
  minContactMs?: number;
  /** A contact may leave its target this long (edge jitter, one lost scan) without restarting its dwell. */
  graceMs?: number;
  onInput: (input: DwellInput) => void;
}

interface ContactState {
  id: string;
  x: number;
  y: number;
  target: SensorTarget | null;
  since: number;
  dwellMs: number;
  lostAt: number | null;
  /** One input per contact: after firing, the contact must be released before it can act again. */
  fired: boolean;
}

/**
 * Turns contacts into wall actions: hit-tests visible targets, applies the dwell rule current when the
 * contact reached the target, and sends at most one input per contact. Contacts missing from an update
 * are released; release itself is never sent to the wall.
 */
export class DwellEngine {
  private readonly minContactMs: number;
  private readonly graceMs: number;
  private readonly onInput: DwellOptions['onInput'];
  private hold: HoldSettings = normalizeHoldSettings(DEFAULT_HOLD_SETTINGS);
  private targets: SensorTarget[] = [];
  private readonly contacts = new Map<string, ContactState>();
  /** While true (calibration), contacts are tracked and previewed but never fire. */
  private suppressedState = false;

  constructor(options: DwellOptions) {
    this.minContactMs = options.minContactMs ?? 250;
    this.graceMs = options.graceMs ?? 120;
    this.onInput = options.onInput;
  }

  get suppressed() {
    return this.suppressedState;
  }

  /**
   * Calibration pauses input. Contacts still present when it ends count as spent, so an object left on a
   * calibration point does not fire the moment calibration mode is switched off.
   */
  set suppressed(on: boolean) {
    if (this.suppressedState && !on) {
      for (const contact of this.contacts.values())
        contact.fired = true;
    }
    this.suppressedState = on;
  }

  setHold(hold: unknown) {
    this.hold = normalizeHoldSettings(hold);
  }

  setTargets(targets: SensorTarget[], now: number) {
    this.targets = targets;
    for (const contact of this.contacts.values()) {
      // A target that disappeared (column opened/closed) is dropped at once, without the jitter grace.
      if (contact.target && !targets.some(item => item.key === contact.target!.key)) {
        contact.target = null;
        contact.lostAt = null;
      }
      this.retarget(contact, now);
    }
  }

  dwellFor(target: SensorTarget): number {
    const rule = target.group ? this.hold[target.group] : null;
    return rule?.enabled ? Math.max(this.minContactMs, rule.seconds * 1000) : this.minContactMs;
  }

  /** Replaces the full contact set (every contact present this frame). */
  update(contacts: Contact[], now: number) {
    const seen = new Set<string>();
    for (const item of contacts) {
      seen.add(item.id);
      let state = this.contacts.get(item.id);
      if (!state) {
        state = { id: item.id, x: item.x, y: item.y, target: null, since: now, dwellMs: 0, lostAt: null, fired: false };
        this.contacts.set(item.id, state);
      }
      state.x = item.x;
      state.y = item.y;
      this.retarget(state, now);
    }
    for (const id of this.contacts.keys()) {
      if (!seen.has(id))
        this.contacts.delete(id);
    }
    this.tick(now);
  }

  private retarget(state: ContactState, now: number) {
    const hit = hitTest(state.x, state.y, this.targets);
    if (hit && hit.key === state.target?.key) {
      state.target = hit;
      state.lostAt = null;
      return;
    }
    if (state.target && state.lostAt === null)
      state.lostAt = now;
    if (state.target && state.lostAt !== null && now - state.lostAt <= this.graceMs)
      return;
    state.target = hit;
    state.since = now;
    state.lostAt = null;
    state.dwellMs = hit ? this.dwellFor(hit) : 0;
  }

  /** Fires every contact whose dwell completed; call on each frame and on a short timer. */
  tick(now: number) {
    for (const state of this.contacts.values()) {
      if (state.lostAt !== null && now - state.lostAt > this.graceMs)
        this.retarget(state, now);
      if (this.suppressed || state.fired || !state.target || state.lostAt !== null || now - state.since < state.dwellMs)
        continue;
      state.fired = true;
      this.onInput({ pointerId: state.id, target: state.target, x: state.x, y: state.y });
    }
  }

  clear() {
    this.contacts.clear();
  }

  get size() {
    return this.contacts.size;
  }

  preview(now: number): SensorAdminContact[] {
    return [...this.contacts.values()].map(state => ({
      id: state.id,
      x: Math.round(state.x),
      y: Math.round(state.y),
      target: state.target?.key ?? null,
      progress: state.fired ? 1 : state.target && state.dwellMs > 0 ? Math.min(1, (now - state.since) / state.dwellMs) : 0,
      fired: state.fired,
    }));
  }
}
