import type { OscArgument, OscMessage } from '../shared/osc';
import type { NormalizedSourceConfig } from '../shared/sensor-config';
import type { Contact } from './dwell';
import { SENSOR_CANVAS } from '../shared/sensor-config';

/** A normalized (0–1, top-left origin) contact as Augmenta and TUIO send it. */
export interface NormalizedContact { id: string; x: number; y: number }

function num(value: OscArgument | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/** Maps normalized contacts onto the logical canvas; contacts outside 0–1 are not on the wall. */
export function normalizedToWall(contacts: NormalizedContact[], options: Pick<NormalizedSourceConfig, 'invertY'>): Contact[] {
  return contacts.flatMap((contact) => {
    if (contact.x < 0 || contact.x >= 1 || contact.y < 0 || contact.y >= 1)
      return [];
    const y = options.invertY ? 1 - contact.y : contact.y;
    return [{ id: contact.id, x: contact.x * SENSOR_CANVAS.width, y: Math.min(SENSOR_CANVAS.height - 0.001, y * SENSOR_CANVAS.height) }];
  });
}

interface Timed extends NormalizedContact { lastSeen: number }

/**
 * Augmenta OSC (Augmenta Simulator, default UDP 12000):
 * - protocol v2: /object/enter|update|leave  frame(i) id(i) slotid(i) age(f) centroid.x(f) centroid.y(f) …
 * - protocol v1: /au/personEntered|personUpdated|personWillLeave  pid(i) oid(i) age(i) centroid.x(f) centroid.y(f) …
 * Extra (`/object/*\/extra`) and scene messages are ignored. Objects without updates expire after timeoutMs.
 */
export class AugmentaReceiver {
  private readonly objects = new Map<string, Timed>();
  private readonly timeoutMs: number;

  constructor(timeoutMs = 1_000) {
    this.timeoutMs = timeoutMs;
  }

  handle(messages: OscMessage[], now: number) {
    for (const message of messages) {
      const { address, args } = message;
      const v2 = address === '/object/enter' || address === '/object/update' || address === '/object/leave';
      const v1 = address === '/au/personEntered' || address === '/au/personUpdated' || address === '/au/personWillLeave';
      if (!v2 && !v1)
        continue;
      const rawId = num(v2 ? args[1] : args[0]);
      if (rawId === null)
        continue;
      const id = `augmenta-${rawId}`;
      if (address === '/object/leave' || address === '/au/personWillLeave') {
        this.objects.delete(id);
        continue;
      }
      const x = num(v2 ? args[4] : args[3]);
      const y = num(v2 ? args[5] : args[4]);
      if (x !== null && y !== null)
        this.objects.set(id, { id, x, y, lastSeen: now });
    }
  }

  contacts(now: number): NormalizedContact[] {
    for (const [id, object] of this.objects) {
      if (now - object.lastSeen > this.timeoutMs)
        this.objects.delete(id);
    }
    return [...this.objects.values()].map(({ id, x, y }) => ({ id, x, y }));
  }

  clear() {
    this.objects.clear();
  }
}

/**
 * TUIO 1.1 cursors (/tuio/2Dcur, default UDP 3333): `alive` lists live session IDs, `set s x y X Y m`
 * updates one, `fseq` closes the frame. Everything clears when no packet arrives for timeoutMs.
 */
export class TuioReceiver {
  private readonly cursors = new Map<string, NormalizedContact>();
  private readonly timeoutMs: number;
  private lastPacket = 0;

  constructor(timeoutMs = 1_500) {
    this.timeoutMs = timeoutMs;
  }

  handle(messages: OscMessage[], now: number) {
    for (const message of messages) {
      if (message.address !== '/tuio/2Dcur')
        continue;
      this.lastPacket = now;
      const [command, ...rest] = message.args;
      if (command === 'alive') {
        const alive = new Set(rest.flatMap(value => num(value) === null ? [] : [`tuio-${value}`]));
        for (const id of this.cursors.keys()) {
          if (!alive.has(id))
            this.cursors.delete(id);
        }
      }
      else if (command === 'set') {
        const session = num(rest[0]);
        const x = num(rest[1]);
        const y = num(rest[2]);
        if (session !== null && x !== null && y !== null)
          this.cursors.set(`tuio-${session}`, { id: `tuio-${session}`, x, y });
      }
    }
  }

  contacts(now: number): NormalizedContact[] {
    if (this.cursors.size && now - this.lastPacket > this.timeoutMs)
      this.cursors.clear();
    return [...this.cursors.values()];
  }

  clear() {
    this.cursors.clear();
  }
}
