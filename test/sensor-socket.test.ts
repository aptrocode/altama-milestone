import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSensorSocket } from '../app/composables/useSensorSocket';
import { installationLayout } from '../app/data/installation-layout';
import { useSystemStore } from '../app/stores/system';
import { useWallStore } from '../app/stores/wall';
import { sensorInput } from './helpers';

class Socket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSED = 3;
  static instances: Socket[] = [];
  readyState = Socket.CONNECTING;
  sent: string[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: (() => void) | null = null;
  constructor(public url: string) { Socket.instances.push(this); }
  open() {
    this.readyState = Socket.OPEN;
    this.onopen?.();
  }

  receive(raw: string) { this.onmessage?.({ data: raw }); }
  send(raw: string) { this.sent.push(raw); }
  close() {
    this.readyState = Socket.CLOSED;
    this.onclose?.();
  }
}

function frame(type: string, overrides: Record<string, unknown> = {}) {
  return JSON.stringify({
    version: 2,
    sessionId: 'service-1',
    seq: 1,
    layoutVersion: installationLayout.layoutVersion,
    type,
    sensorReady: true,
    calibrated: true,
    ...overrides,
  });
}

const clients: ReturnType<typeof useSensorSocket>[] = [];
function setup(enabled = true) {
  const pinia = createPinia();
  setActivePinia(pinia);
  const wall = useWallStore(pinia);
  const system = useSystemStore(pinia);
  const onMessage = vi.fn();
  const client = useSensorSocket({
    enabled,
    url: 'ws://localhost:8787',
    expectedLayoutVersion: installationLayout.layoutVersion,
    getColumns: () => wall.columns,
    onMessage,
  });
  clients.push(client);
  client.start();
  return { wall, system, client, onMessage, socket: Socket.instances.at(-1)! };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('WebSocket', Socket);
  Socket.instances = [];
});
afterEach(() => {
  clients.splice(0).forEach(client => client.stop());
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('sensor socket lifecycle', () => {
  it('reports a rejected WebSocket URL without crashing the wall', () => {
    vi.stubGlobal('WebSocket', class {
      constructor() { throw new Error('Invalid URL'); }
    });
    const { system } = setup();
    expect(system.socketStatus).toBe('error');
    expect(system.lastError).toContain('URL tidak valid');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('publishes protocol v2 and current UI state for Sensor Service target selection', () => {
    const { wall, client, socket } = setup();
    socket.open();
    expect(JSON.parse(socket.sent[0]!)).toMatchObject({ version: 2, type: 'clientHello', columns: wall.columns });
    wall.dispatch({ type: 'language', columnId: 6, locale: 'en' });
    client.publishState();
    expect(JSON.parse(socket.sent[1]!)).toMatchObject({ type: 'clientState', columns: { 6: { locale: 'en' } } });
  });

  it('requires handshake, device readiness, and calibration before dispatching input', () => {
    const { onMessage, socket } = setup();
    socket.open();
    socket.receive(sensorInput({ type: 'main', columnId: 3 }, { seq: 2 }));
    socket.receive(frame('hello', { calibrated: false }));
    socket.receive(sensorInput({ type: 'main', columnId: 3 }, { seq: 2 }));
    expect(onMessage.mock.calls.filter(([message]) => message.type === 'input')).toHaveLength(0);
    socket.receive(frame('status', { seq: 3 }));
    socket.receive(sensorInput({ type: 'main', columnId: 3 }, { seq: 4 }));
    expect(onMessage.mock.calls.filter(([message]) => message.type === 'input')).toHaveLength(1);
  });

  it('rejects duplicate sequences, stale sessions, replayed handshakes, and mismatched layouts', () => {
    const { onMessage, system, socket } = setup();
    socket.open();
    socket.receive(frame('hello'));
    socket.receive(sensorInput({ type: 'main', columnId: 6 }, { seq: 2 }));
    socket.receive(frame('hello'));
    socket.receive(sensorInput({ type: 'main', columnId: 6 }, { seq: 2 }));
    socket.receive(sensorInput({ type: 'main', columnId: 6 }, { seq: 3, sessionId: 'stale-session' }));
    expect(onMessage.mock.calls.filter(([message]) => message.type === 'input')).toHaveLength(1);
    socket.receive(frame('status', { seq: 3, layoutVersion: 'layout-v4' }));
    expect(system.socketStatus).toBe('error');
    expect(system.calibrationReady).toBe(false);
  });

  it('marks a missing heartbeat stale and cancels reconnect/heartbeat resources on stop', () => {
    const { client, system, socket } = setup();
    socket.open();
    socket.receive(frame('hello'));
    vi.advanceTimersByTime(7000);
    expect(system.sensorReady).toBe(false);
    expect(socket.readyState).toBe(Socket.CLOSED);
    client.stop();
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(30000);
    expect(Socket.instances).toHaveLength(1);
  });

  it('does not enable a disabled sensor when reconnect is requested', () => {
    const { client } = setup(false);
    client.reconnect();
    expect(Socket.instances).toHaveLength(0);
  });
});
