import type { ColumnId, ColumnSnapshot } from '../../shared/wall';
import type { SensorMessage } from '~/types/sensor';
import { useSystemStore } from '~/stores/system';
import { SENSOR_PROTOCOL_VERSION } from '~/types/sensor';
import { parseSensorMessage } from '~/utils/sensor-message';

export interface SensorSocketOptions {
  enabled: boolean;
  url: string;
  expectedLayoutVersion: string;
  onMessage: (message: SensorMessage) => void;
  getColumns: () => Record<ColumnId, ColumnSnapshot>;
  heartbeatTimeoutMs?: number;
  maxMessageBytes?: number;
}

export interface SensorSocketController {
  start: () => void;
  stop: () => void;
  reconnect: () => void;
  publishState: () => void;
}

const RECONNECT_DELAYS = [500, 1_000, 2_000, 4_000, 8_000, 10_000] as const;

export function useSensorSocket(options: SensorSocketOptions): SensorSocketController {
  const system = useSystemStore();
  const heartbeatTimeoutMs = options.heartbeatTimeoutMs ?? 6_000;
  const maxMessageBytes = options.maxMessageBytes ?? 8_192;
  let socket: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  let reconnectAttempt = 0;
  let generation = 0;
  let stopped = true;
  let lastSeenAt = 0;
  let activeSessionId: string | null = null;
  let lastSequence = -1;

  function clearTimers() {
    if (reconnectTimer)
      clearTimeout(reconnectTimer);
    if (heartbeatTimer)
      clearInterval(heartbeatTimer);
    reconnectTimer = null;
    heartbeatTimer = null;
  }

  function closeSocket(code = 1000, reason = 'client stop') {
    if (!socket)
      return;

    socket.onopen = null;
    socket.onmessage = null;
    socket.onerror = null;
    socket.onclose = null;
    if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)
      socket.close(code, reason);
    socket = null;
  }

  function scheduleReconnect(localGeneration: number) {
    if (stopped || localGeneration !== generation)
      return;

    const baseDelay = RECONNECT_DELAYS[Math.min(reconnectAttempt, RECONNECT_DELAYS.length - 1)]!;
    const jitter = Math.round(baseDelay * (Math.random() * 0.3 - 0.15));
    reconnectAttempt++;
    system.setSocketStatus('reconnecting');
    reconnectTimer = setTimeout(connect, baseDelay + jitter, localGeneration);
  }

  function acceptMessage(message: SensorMessage): boolean {
    if (message.layoutVersion !== options.expectedLayoutVersion) {
      system.setSensorHealth(false, false);
      system.setSocketStatus('error', `Layout mismatch: ${message.layoutVersion}`);
      return false;
    }

    if (message.type === 'hello') {
      if (activeSessionId !== null)
        return false;
      activeSessionId = message.sessionId;
      lastSequence = message.seq;
      return true;
    }

    if (message.sessionId !== activeSessionId || message.seq <= lastSequence)
      return false;

    lastSequence = message.seq;
    return true;
  }

  function connect(localGeneration = generation) {
    if (stopped || localGeneration !== generation)
      return;

    if (!options.url) {
      system.setSocketStatus('error', 'Sensor WebSocket URL belum dikonfigurasi');
      return;
    }

    closeSocket();
    system.setSocketStatus(reconnectAttempt > 0 ? 'reconnecting' : 'connecting');
    let nextSocket: WebSocket;
    try {
      nextSocket = new WebSocket(options.url);
    }
    catch {
      system.setSocketStatus('error', 'Sensor WebSocket URL tidak valid atau tidak diizinkan browser');
      return;
    }
    socket = nextSocket;

    nextSocket.onopen = () => {
      if (stopped || localGeneration !== generation || socket !== nextSocket)
        return;

      reconnectAttempt = 0;
      activeSessionId = null;
      lastSequence = -1;
      lastSeenAt = Date.now();
      system.setSocketStatus('connected');
      nextSocket.send(JSON.stringify({
        version: SENSOR_PROTOCOL_VERSION,
        type: 'clientHello',
        layoutVersion: options.expectedLayoutVersion,
        columns: options.getColumns(),
      }));

      heartbeatTimer = setInterval(() => {
        if (Date.now() - lastSeenAt <= heartbeatTimeoutMs)
          return;

        system.setSensorHealth(false, false);
        system.setSocketStatus('stale', 'Sensor heartbeat timeout');
        nextSocket.close(4000, 'heartbeat timeout');
      }, 1_000);
    };

    nextSocket.onmessage = (event) => {
      if (stopped || localGeneration !== generation || socket !== nextSocket)
        return;

      if (typeof event.data !== 'string' || new TextEncoder().encode(event.data).byteLength > maxMessageBytes) {
        system.setSocketStatus('error', 'Sensor message tidak valid atau terlalu besar');
        return;
      }

      const result = parseSensorMessage(event.data);
      if (!result.ok) {
        system.setSocketStatus('error', result.error);
        return;
      }

      if (!acceptMessage(result.message))
        return;

      lastSeenAt = Date.now();
      system.markMessageReceived(lastSeenAt);
      if (result.message.type === 'hello' || result.message.type === 'status') {
        system.setSensorHealth(result.message.sensorReady, result.message.calibrated);
        system.setSocketStatus('connected');
      }
      if (result.message.type !== 'input' || (system.sensorReady && system.calibrationReady))
        options.onMessage(result.message);
    };

    nextSocket.onerror = () => {
      if (localGeneration === generation)
        system.setSocketStatus('error', 'Sensor WebSocket error');
    };

    nextSocket.onclose = () => {
      if (socket === nextSocket)
        socket = null;
      if (heartbeatTimer)
        clearInterval(heartbeatTimer);
      heartbeatTimer = null;
      system.setSensorHealth(false, false);
      scheduleReconnect(localGeneration);
    };
  }

  function start() {
    stop();
    if (!options.enabled) {
      stopped = true;
      system.setSocketStatus('disabled');
      return;
    }

    stopped = false;
    generation++;
    reconnectAttempt = 0;
    connect(generation);
  }

  function stop() {
    stopped = true;
    generation++;
    clearTimers();
    closeSocket();
    activeSessionId = null;
    lastSequence = -1;
    system.setSensorHealth(false, false);
    system.setSocketStatus('disabled');
  }

  function reconnect() {
    start();
  }

  function publishState() {
    if (stopped || socket?.readyState !== WebSocket.OPEN)
      return;
    socket.send(JSON.stringify({
      version: SENSOR_PROTOCOL_VERSION,
      type: 'clientState',
      layoutVersion: options.expectedLayoutVersion,
      columns: options.getColumns(),
    }));
  }

  return { start, stop, reconnect, publishState };
}
