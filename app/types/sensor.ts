import type { SectionId } from './milestone';

export const SENSOR_PROTOCOL_VERSION = 1 as const;

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

export interface SensorTouchStartMessage extends SensorEnvelope {
  type: 'touchStart';
  section: SectionId;
  target: 'artwork';
  pointerId: string;
  x: number;
  y: number;
}

export interface SensorTouchEndMessage extends SensorEnvelope {
  type: 'touchEnd';
  section: SectionId;
  pointerId: string;
}

export interface SensorSelectMilestoneMessage extends SensorEnvelope {
  type: 'selectMilestone';
  section: SectionId;
  pointerId: string;
  milestoneId: string;
  x: number;
  y: number;
}

export type SensorMessage
  = | SensorHelloMessage
    | SensorStatusMessage
    | SensorHeartbeatMessage
    | SensorTouchStartMessage
    | SensorTouchEndMessage
    | SensorSelectMilestoneMessage;

export type SensorSocketStatus = 'disabled' | 'connecting' | 'connected' | 'reconnecting' | 'stale' | 'error';

export interface SensorParseSuccess {
  ok: true;
  message: SensorMessage;
}

export interface SensorParseFailure {
  ok: false;
  error: string;
}

export type SensorParseResult = SensorParseSuccess | SensorParseFailure;
