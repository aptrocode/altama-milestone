import type { Point2, SensorAdminClientMessage, SensorAdminContact, SensorAdminServerMessage, SensorConfig, SensorServiceStatus } from '../../shared/sensor-config';
import { onScopeDispose, ref, shallowRef } from 'vue';
import { normalizeSensorConfig, SENSOR_ADMIN_VERSION } from '../../shared/sensor-config';

export interface SensorAdminResult { request: string; ok: boolean; error?: string }

/**
 * /dashboard connection to the Sensor Service admin contract (shared/sensor-config.ts). Reconnects every
 * two seconds while the owning scope lives; the socket never enters Pinia.
 */
export function useSensorAdmin(url: string) {
  const connected = ref(false);
  const config = shallowRef<SensorConfig | null>(null);
  const status = shallowRef<SensorServiceStatus | null>(null);
  const contacts = shallowRef<SensorAdminContact[]>([]);
  const sensorPoints = shallowRef<Point2[]>([]);
  const result = shallowRef<SensorAdminResult | null>(null);
  let socket: WebSocket | null = null;
  let retry: ReturnType<typeof setTimeout> | null = null;
  let disposed = false;

  function handle(raw: unknown) {
    if (typeof raw !== 'string')
      return;
    let message: SensorAdminServerMessage;
    try {
      message = JSON.parse(raw) as SensorAdminServerMessage;
    }
    catch {
      return;
    }
    if (message?.version !== SENSOR_ADMIN_VERSION)
      return;
    if (message.type === 'adminState') {
      config.value = normalizeSensorConfig(message.config);
      status.value = message.status;
    }
    else if (message.type === 'adminContacts') {
      contacts.value = Array.isArray(message.contacts) ? message.contacts : [];
      sensorPoints.value = Array.isArray(message.sensorPoints) ? message.sensorPoints : [];
    }
    else if (message.type === 'adminResult') {
      result.value = { request: message.request, ok: message.ok, ...(message.error ? { error: message.error } : {}) };
    }
  }

  function connect() {
    if (disposed)
      return;
    let next: WebSocket;
    try {
      next = new WebSocket(url);
    }
    catch {
      retry = setTimeout(connect, 2_000);
      return;
    }
    socket = next;
    next.onopen = () => {
      connected.value = true;
      next.send(JSON.stringify({ version: SENSOR_ADMIN_VERSION, type: 'adminHello' }));
    };
    next.onmessage = event => handle(event.data);
    next.onclose = () => {
      if (socket === next)
        socket = null;
      connected.value = false;
      contacts.value = [];
      sensorPoints.value = [];
      if (!disposed)
        retry = setTimeout(connect, 2_000);
    };
  }

  function send(message: SensorAdminClientMessage): boolean {
    if (socket?.readyState !== WebSocket.OPEN)
      return false;
    result.value = null;
    socket.send(JSON.stringify(message));
    return true;
  }

  connect();
  onScopeDispose(() => {
    disposed = true;
    if (retry)
      clearTimeout(retry);
    if (socket) {
      socket.onclose = null;
      socket.close();
    }
    socket = null;
  });

  return { connected, config, status, contacts, sensorPoints, result, send };
}
