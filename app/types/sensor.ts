import type { WallAction } from '../../shared/wall';

export const SENSOR_PROTOCOL_VERSION = 2 as const;

interface SensorEnvelope {
  version: typeof SENSOR_PROTOCOL_VERSION;
  sessionId: string;
  seq: number;
  layoutVersion: string;
}

export interface SensorHelloMessage extends SensorEnvelope {
  type: 'hello';
  sensorReady: boolean;
  calibrated: boolean;
}

export interface SensorStatusMessage extends SensorEnvelope {
  type: 'status';
  sensorReady: boolean;
  calibrated: boolean;
  detail?: string;
}

export interface SensorHeartbeatMessage extends SensorEnvelope {
  type: 'heartbeat';
}

export interface SensorInputMessage extends SensorEnvelope {
  type: 'input';
  action: WallAction;
  pointerId: string;
  x: number;
  y: number;
}

export type SensorMessage = SensorHelloMessage | SensorStatusMessage | SensorHeartbeatMessage | SensorInputMessage;
export type SensorSocketStatus = 'disabled' | 'connecting' | 'connected' | 'reconnecting' | 'stale' | 'error';
export type SensorParseResult = { ok: true; message: SensorMessage } | { ok: false; error: string };
