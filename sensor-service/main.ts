/// <reference types="@types/bun" />

import type { Buffer } from 'node:buffer';
import type { OscMessage } from '../shared/osc';
import type { SensorConfig } from '../shared/sensor-config';
import type { ServiceClient } from './service';
import dgram from 'node:dgram';
import { resolve } from 'node:path';
import process from 'node:process';
import Bun from 'bun';
import { parseOscPacket } from '../shared/osc';
import { backgroundPathFor, loadBackground, loadConfig, saveBackground, saveConfig } from './config-file';
import { HokuyoClient } from './hokuyo';
import { SensorService } from './service';

/**
 * Altama Sensor Service: WebSocket 8787 for the wall (protocol v2) and /dashboard (admin), OSC show
 * control on UDP 9000, and one touch source (Hokuyo UST-10LX, Augmenta, or TUIO) from sensor-config.json.
 */
const WS_PORT = Number.parseInt(process.env.WS_PORT || '8787', 10);
const WS_HOST = process.env.WS_HOST || '0.0.0.0';
const CONFIG_PATH = resolve(process.env.SENSOR_CONFIG || 'sensor-config.json');
const BACKGROUND_PATH = backgroundPathFor(CONFIG_PATH);

function log(text: string) {
  return process.stdout.write(`${new Date().toISOString().slice(11, 23)} ${text}
`);
}

/** One UDP OSC port; rebinding closes the previous socket first. */
class OscListener {
  private socket: dgram.Socket | null = null;
  port = 0;

  constructor(private readonly name: string, private readonly onMessages: (messages: OscMessage[]) => void, private readonly onState: (ready: boolean, detail: string) => void) {}

  bind(port: number) {
    this.close();
    this.port = port;
    // No reuseAddr: a port already used by another app (or another source) must fail visibly.
    const socket = dgram.createSocket('udp4');
    this.socket = socket;
    socket.on('message', (buffer: Buffer) => {
      try {
        this.onMessages(parseOscPacket(new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)));
      }
      catch (error) {
        log(`[${this.name}] bad packet: ${String(error)}`);
      }
    });
    socket.on('listening', () => {
      log(`[${this.name}] UDP ${port}`);
      this.onState(true, '');
    });
    socket.on('error', (error) => {
      log(`[${this.name}] ${error.message}`);
      this.onState(false, `${this.name} udp ${port}: ${error.message}`.slice(0, 200));
      this.close();
    });
    socket.bind(port);
  }

  close() {
    this.socket?.removeAllListeners();
    this.socket?.on('error', () => {});
    try {
      this.socket?.close();
    }
    catch {}
    this.socket = null;
  }
}

let hokuyo: HokuyoClient | null = null;

const service = new SensorService({
  config: loadConfig(CONFIG_PATH),
  background: loadBackground(BACKGROUND_PATH),
  saveConfig: config => saveConfig(CONFIG_PATH, config),
  saveBackground: ranges => saveBackground(BACKGROUND_PATH, ranges),
  onConfig: (next, previous) => applyTransports(next, previous),
  log,
});

const showControl = new OscListener('OSC', messages => service.handleShowControl(messages), () => {});
const augmenta = new OscListener('Augmenta', messages => service.handleAugmenta(messages), (ready, detail) => service.config.source === 'augmenta' && service.setSourceState(ready, detail));
const tuio = new OscListener('TUIO', messages => service.handleTuio(messages), (ready, detail) => service.config.source === 'tuio' && service.setSourceState(ready, detail));

function startHokuyo(config: SensorConfig) {
  hokuyo?.stop();
  service.setSourceState(false, 'hokuyo connecting', 0);
  const client: HokuyoClient = new HokuyoClient({
    host: config.hokuyo.host,
    port: config.hokuyo.port,
    onScan: (ranges, params) => service.handleScan(ranges, params),
    onStatus: (status) => {
      // A stopped client (source switched or host changed) must not overwrite the new source's status.
      if (hokuyo !== client || service.config.source !== 'hokuyo')
        return;
      const detail = status.streaming ? '' : status.connected ? 'hokuyo no scans' : `hokuyo ${status.error || 'offline'}`;
      service.setSourceState(status.streaming, detail, status.scanRate);
    },
    log,
  });
  hokuyo = client;
  client.start();
}

function applyTransports(next: SensorConfig, previous: SensorConfig | null) {
  if (!previous || next.osc.port !== previous.osc.port)
    showControl.bind(next.osc.port);

  const sourceChanged = !previous || next.source !== previous.source;
  if (sourceChanged || next.hokuyo.host !== previous.hokuyo.host || next.hokuyo.port !== previous.hokuyo.port) {
    hokuyo?.stop();
    hokuyo = null;
    if (next.source === 'hokuyo')
      startHokuyo(next);
  }
  if (sourceChanged || next.augmenta.port !== previous.augmenta.port) {
    augmenta.close();
    if (next.source === 'augmenta')
      augmenta.bind(next.augmenta.port);
  }
  if (sourceChanged || next.tuio.port !== previous.tuio.port) {
    tuio.close();
    if (next.source === 'tuio')
      tuio.bind(next.tuio.port);
  }
}

interface SocketData { client: ServiceClient | null }

Bun.serve<SocketData>({
  port: WS_PORT,
  hostname: WS_HOST,
  fetch(request, server) {
    if (server.upgrade(request, { data: { client: null } }))
      return;
    return new Response(`Altama Sensor Service: ws://${WS_HOST}:${WS_PORT}\n`);
  },
  websocket: {
    maxPayloadLength: 64 * 1024,
    open(ws) {
      const client: ServiceClient = { send: data => ws.send(data) };
      ws.data.client = client;
      service.addClient(client);
    },
    message(ws, message) {
      if (ws.data.client)
        service.handleMessage(ws.data.client, String(message));
    },
    close(ws) {
      if (ws.data.client)
        service.removeClient(ws.data.client);
    },
  },
});

applyTransports(service.config, null);
setInterval(() => service.tick(), 30);
setInterval(() => service.heartbeat(), 2_000);
setInterval(() => service.hasAdmins && service.publishContacts(), 100);

log(`[Sensor] ws://${WS_HOST}:${WS_PORT} · config ${CONFIG_PATH} · source ${service.config.source}`);

function shutdown() {
  hokuyo?.stop();
  setTimeout(() => process.exit(0), 350);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
