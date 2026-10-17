/// <reference types="@types/bun" />

import type { Server, ServerWebSocket } from 'bun';
import type { Buffer } from 'node:buffer';
import type { RemoteInfo } from 'node:dgram';
import type { ColumnId, ColumnSnapshot, WallAction } from '../shared/wall';
import dgram from 'node:dgram';
import process from 'node:process';
import Bun from 'bun';
import rawLayout from '../shared/installation-layout.json';
import { oscToWallActions, parseOscPacket } from '../shared/osc';

const WS_PORT = Number.parseInt(process.env.WS_PORT || '8787', 10);
const OSC_PORT = Number.parseInt(process.env.OSC_PORT || '9000', 10);
const SESSION_ID = `osc-service-${Date.now()}`;
let seq = 0;

interface TargetRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function getTargetRect(action: WallAction): TargetRect {
  const column = rawLayout.columns.find(col => col.id === action.columnId);
  if (!column)
    return { x: 100, y: 100, width: 100, height: 100 };

  switch (action.type) {
    case 'main':
      return column.main || column.card;
    case 'back':
      return column.active.back;
    case 'previous':
      return column.active.previous;
    case 'next':
      return column.active.next;
    case 'page':
      return column.active.pages.find(item => item.page === action.page) || column.active.card;
    case 'subItem': {
      const item = column.subItems?.find(i => i.key === action.subItemId);
      return item || column.card;
    }
    case 'language': {
      const lang = column.languages.find(l => l.locale === action.locale);
      return lang || column.languageBar;
    }
  }
}

/** Brand/distribution columns have no main target; OSC "open" selects their first tile instead. */
function toTargetAction(action: WallAction): WallAction {
  const column = rawLayout.columns.find(col => col.id === action.columnId);
  if (action.type === 'main' && !column?.main && column?.subItems?.[0])
    return { type: 'subItem', columnId: action.columnId, subItemId: column.subItems[0].key };
  return action;
}

let currentColumns = Object.fromEntries(rawLayout.columns.map(column => [
  column.id,
  { phase: 'idle', locale: 'id', subItem: '', photo: 0, page: 0 },
])) as Record<ColumnId, ColumnSnapshot>;

interface ConnectedClient {
  send: (data: string) => void;
}

const clients = new Set<ConnectedClient>();

function broadcast(payload: Record<string, unknown>) {
  const serialized = JSON.stringify(payload);
  for (const client of clients) {
    try {
      client.send(serialized);
    }
    catch (err) {
      console.error('[WS] Failed to send to client:', err);
    }
  }
}

function handleClientMessage(raw: string, client: ConnectedClient) {
  try {
    const data = JSON.parse(raw);
    if (data.type === 'clientHello' || data.type === 'clientState') {
      if (data.columns) {
        currentColumns = { ...currentColumns, ...data.columns };
      }
      if (data.type === 'clientHello') {
        client.send(JSON.stringify({
          version: 2,
          sessionId: SESSION_ID,
          seq: ++seq,
          layoutVersion: rawLayout.layoutVersion,
          type: 'hello',
          sensorReady: true,
          calibrated: true,
        }));
        console.log('[WS] Handshake established with Nuxt Kiosk client.');
      }
    }
  }
  catch (err) {
    console.warn('[WS] Invalid client frame:', err);
  }
}

// 1. WebSocket Server on port 8787 (Using Bun.serve)
if (typeof Bun !== 'undefined') {
  Bun.serve({
    port: WS_PORT,
    websocket: {
      open(ws: ServerWebSocket<undefined>) {
        const client: ConnectedClient = { send: data => ws.send(data) };
        (ws as unknown as { clientRef: ConnectedClient }).clientRef = client;
        clients.add(client);
        console.log(`[WS] Nuxt kiosk connected (${clients.size} client(s) active)`);
      },
      message(ws: ServerWebSocket<undefined>, message: string | Buffer) {
        const client = (ws as unknown as { clientRef: ConnectedClient }).clientRef;
        handleClientMessage(String(message), client);
      },
      close(ws: ServerWebSocket<undefined>) {
        const client = (ws as unknown as { clientRef: ConnectedClient }).clientRef;
        if (client)
          clients.delete(client);
        console.log(`[WS] Nuxt kiosk disconnected (${clients.size} client(s) active)`);
      },
    },
    fetch(req: Request, server: Server<undefined>) {
      if (server.upgrade(req))
        return;
      return new Response('Altama Sensor & OSC Service is running on ws://127.0.0.1:8787');
    },
  });
  console.log(`📡 WebSocket server listening on ws://127.0.0.1:${WS_PORT}`);
}

// 2. Heartbeat Timer (every 2s as required by docs/sensor.md protocol v2)
setInterval(() => {
  if (clients.size > 0) {
    broadcast({
      version: 2,
      sessionId: SESSION_ID,
      seq: ++seq,
      layoutVersion: rawLayout.layoutVersion,
      type: 'heartbeat',
      sensorReady: true,
      calibrated: true,
    });
  }
}, 2_000);

// 3. UDP OSC Listener on port 9000 (Resolume Arena / TouchDesigner)
const udp = dgram.createSocket('udp4');

udp.on('message', (buffer: Buffer, rinfo: RemoteInfo) => {
  try {
    const oscMessages = parseOscPacket(buffer);
    for (const msg of oscMessages) {
      console.log(`[OSC] Received ${msg.address} ${JSON.stringify(msg.args)} from ${rinfo.address}:${rinfo.port}`);
      const actions = oscToWallActions(msg, currentColumns);
      for (const action of actions.map(toTargetAction)) {
        const rect = getTargetRect(action);
        const inputFrame = {
          version: 2,
          sessionId: SESSION_ID,
          seq: ++seq,
          layoutVersion: rawLayout.layoutVersion,
          type: 'input',
          pointerId: 'osc-showcontrol',
          x: rect.x + rect.width / 2,
          y: rect.y + rect.height / 2,
          action,
        };
        broadcast(inputFrame);
        console.log(`  ↪ Dispatched action:`, JSON.stringify(action));
      }
    }
  }
  catch (err) {
    console.error('[OSC] Error parsing packet:', err);
  }
});

udp.on('listening', () => {
  const addr = udp.address();
  console.log(`🎛️  OSC UDP Server listening on 0.0.0.0:${addr.port} (Resolume / TouchDesigner ready)`);
  console.log('   Commands:');
  console.log('   - /altama/column <1-6>         (Toggle main/back on column)');
  console.log('   - /altama/open <1-6>           (Open column directly)');
  console.log('   - /altama/back [1-6]           (Back in column, or all if omitted)');
  console.log('   - /altama/next <1-6>           (Next photo in slider)  ');
  console.log('   - /altama/prev <1-6>           (Previous photo in slider)');
  console.log('   - /altama/page <col> <page>    (Show text page, e.g. 2 2)');
  console.log('   - /altama/subItem <col> <key>  (Select subItem, e.g. 2 tekiro)');
  console.log('   - /altama/lang [col] <locale>  (Set locale: id, en, zh-Hans)');
  console.log('   - /altama/reset                (Reset all open columns to idle)');
});

udp.bind(OSC_PORT);
