import type { WallAction } from '../shared/wall';
import { SENSOR_LAYOUT_VERSION } from '../shared/sensor-targets';

export const PROTOCOL_VERSION = 2 as const;

/** Builds protocol v2 frames (docs/sensor.md) with one session ID and one increasing sequence per boot. */
export class ProtocolWriter {
  readonly sessionId: string;
  private seq = 0;

  constructor(sessionId = `sensor-service-${Date.now().toString(36)}`) {
    this.sessionId = sessionId;
  }

  private envelope(type: string) {
    return { version: PROTOCOL_VERSION, sessionId: this.sessionId, seq: ++this.seq, layoutVersion: SENSOR_LAYOUT_VERSION, type };
  }

  hello(sensorReady: boolean, calibrated: boolean): string {
    return JSON.stringify({ ...this.envelope('hello'), sensorReady, calibrated });
  }

  status(sensorReady: boolean, calibrated: boolean, detail?: string): string {
    const text = detail?.trim().slice(0, 240);
    return JSON.stringify({ ...this.envelope('status'), sensorReady, calibrated, ...(text ? { detail: text } : {}) });
  }

  heartbeat(): string {
    return JSON.stringify(this.envelope('heartbeat'));
  }

  /** x/y are floored so a point inside an integer target rectangle stays inside it. */
  input(pointerId: string, x: number, y: number, action: WallAction): string {
    return JSON.stringify({ ...this.envelope('input'), pointerId: pointerId.slice(0, 96), x: Math.floor(x), y: Math.floor(y), action });
  }
}
