/// <reference types="@types/bun" />

/**
 * Hardware-free inputs for the Sensor Service.
 *
 *   bun run sensor:sim hokuyo   [--port 10940] [--tap x,y[,s]]… [--loop] [--print-calibration]
 *   bun run sensor:sim augmenta [--host 127.0.0.1] [--port 12000] [--v1] [--flip-y] [--tap …] [--loop]
 *   bun run sensor:sim tuio     [--host 127.0.0.1] [--port 3333] [--flip-y] [--tap …] [--loop]
 *
 * Taps are logical wall px (2304 × 1344) held for s seconds (default 1.5); join simultaneous contacts
 * with "+", e.g. --tap 212,700+588,700,1.5. hokuyo emulates a UST-10LX (SCIP 2.0 over TCP) using the
 * DEMO_RIG geometry; --print-calibration prints the matching calibration points for sensor-config.json.
 */
import type { SyntheticHand } from './synthetic';
import dgram from 'node:dgram';
import net from 'node:net';
import process from 'node:process';
import { createOscBundle, createOscMessage } from '../shared/osc';
import { DEFAULT_CALIBRATION_WALL_POINTS, SENSOR_CANVAS } from '../shared/sensor-config';
import { encodeScanReply, scipChecksum, statusLine } from './scip';
import { DEMO_RIG, renderScan, wallToSensor } from './synthetic';

interface Step { hands: SyntheticHand[]; seconds: number }

function print(text: string) {
  return process.stdout.write(`${text}
`);
}
const argv = process.argv.slice(2);
const mode = argv[0];
const flag = (name: string) => argv.includes(`--${name}`);
function option(name: string, fallback: string): string {
  const index = argv.indexOf(`--${name}`);
  return index >= 0 && argv[index + 1] ? argv[index + 1]! : fallback;
}

function parseTaps(): Step[] {
  const steps: Step[] = [];
  argv.forEach((value, index) => {
    if (value !== '--tap' || !argv[index + 1])
      return;
    let seconds = 1.5;
    const hands = argv[index + 1]!.split('+').map((part) => {
      const [x, y, s] = part.split(',').map(Number);
      if (s !== undefined && Number.isFinite(s))
        seconds = s;
      return { x: x!, y: y! };
    }).filter(hand => Number.isFinite(hand.x) && Number.isFinite(hand.y));
    if (hands.length)
      steps.push({ hands, seconds });
  });
  return steps;
}

/** Plays taps with a short gap, returns the hands present at a time since start (null when finished). */
function timeline(steps: Step[], loop: boolean, gap = 0.8, lead = 1) {
  const total = steps.reduce((sum, step) => sum + step.seconds + gap, 0);
  return (elapsed: number): SyntheticHand[] | null => {
    let t = elapsed - lead;
    if (t < 0)
      return [];
    if (loop && total > 0)
      t %= total;
    for (const step of steps) {
      if (t < step.seconds)
        return step.hands;
      t -= step.seconds;
      if (t < gap)
        return [];
      t -= gap;
    }
    return null;
  };
}

const steps = parseTaps();
const loop = flag('loop');
const host = option('host', '127.0.0.1');

function logHands(label: string, hands: SyntheticHand[], last: { key: string }) {
  const key = hands.map(hand => `${hand.x},${hand.y}`).join(' + ');
  if (key !== last.key)
    print(`[${label}] ${key || '—'}`);
  last.key = key;
}

function runHokuyo() {
  if (flag('print-calibration')) {
    const calibration = DEFAULT_CALIBRATION_WALL_POINTS.map(wall => ({ wall, sensor: (({ x, y }) => ({ x: Math.round(x), y: Math.round(y) }))(wallToSensor(wall)) }));
    print(JSON.stringify({ hokuyo: { host: '127.0.0.1', port: Number(option('port', '10940')), calibration } }, null, 2));
    return;
  }
  const port = Number(option('port', '10940'));
  const params = DEMO_RIG.params;
  const server = net.createServer((socket) => {
    print('[hokuyo-sim] client connected');
    let stream: ReturnType<typeof setInterval> | null = null;
    let buffer = '';
    const startedAt = Date.now();
    const play = timeline(steps, loop);
    const last = { key: '' };
    const stop = () => {
      if (stream)
        clearInterval(stream);
      stream = null;
    };
    socket.on('data', (chunk) => {
      buffer += chunk.toString('latin1').replace(/\r/g, '');
      let end = buffer.indexOf('\n');
      while (end !== -1) {
        const command = buffer.slice(0, end);
        buffer = buffer.slice(end + 1);
        end = buffer.indexOf('\n');
        if (!command)
          continue;
        const code = command.slice(0, 2);
        if (code === 'PP') {
          const lines = [`MODL:UST-10LX(simulated)`, 'DMIN:20', 'DMAX:30000', `ARES:${params.ares}`, `AMIN:${params.amin}`, `AMAX:${params.amax}`, `AFRT:${params.afrt}`, `SCAN:${params.scanRate * 60}`];
          socket.write(`PP\n${statusLine('00')}${lines.map(line => `${line};${scipChecksum(line)}\n`).join('')}\n`);
        }
        else if (code === 'MD') {
          socket.write(`${command}\n${statusLine('00')}\n`);
          stop();
          stream = setInterval(() => {
            const hands = play((Date.now() - startedAt) / 1000) ?? [];
            logHands('hokuyo-sim', hands, last);
            socket.write(encodeScanReply(command, renderScan(hands, DEMO_RIG, 4), Date.now() % 0xFFFFFF));
          }, 1000 / params.scanRate);
        }
        else if (code === 'QT' || code === 'BM' || code === 'RS') {
          if (code !== 'BM')
            stop();
          socket.write(`${command}\n${statusLine('00')}\n`);
        }
        else {
          socket.write(`${command}\n${statusLine('0E')}\n`);
        }
      }
    });
    socket.on('close', () => {
      stop();
      print('[hokuyo-sim] client disconnected');
    });
    socket.on('error', () => stop());
  });
  server.listen(port, () => print(`[hokuyo-sim] UST-10LX on tcp ${port}; calibration: --print-calibration`));
}

function runUdp(label: string, defaultPort: number, frame: (hands: SyntheticHand[], frameNo: number, ids: number[]) => Uint8Array[]) {
  const port = Number(option('port', String(defaultPort)));
  const socket = dgram.createSocket('udp4');
  const play = timeline(steps, loop);
  const startedAt = Date.now();
  const last = { key: '' };
  let frameNo = 0;
  let nextId = 1;
  let ids: number[] = [];
  let previousCount = 0;
  print(`[${label}] → ${host}:${port}`);
  const timer = setInterval(() => {
    const hands = play((Date.now() - startedAt) / 1000);
    if (hands === null) {
      for (const packet of frame([], ++frameNo, []))
        socket.send(packet, port, host);
      clearInterval(timer);
      setTimeout(() => socket.close(), 200);
      return;
    }
    if (hands.length !== previousCount)
      ids = hands.map(() => nextId++);
    previousCount = hands.length;
    logHands(label, hands, last);
    for (const packet of frame(hands, ++frameNo, ids))
      socket.send(packet, port, host);
  }, 1000 / 30);
}

const flipY = flag('flip-y');
const nx = (hand: SyntheticHand) => ({ float: hand.x / SENSOR_CANVAS.width });
const ny = (hand: SyntheticHand) => ({ float: flipY ? 1 - hand.y / SENSOR_CANVAS.height : hand.y / SENSOR_CANVAS.height });

if (mode === 'hokuyo') {
  runHokuyo();
}
else if (mode === 'augmenta') {
  const v1 = flag('v1');
  let present = new Set<number>();
  runUdp('augmenta-sim', 12000, (hands, frameNo, ids) => {
    const packets: Uint8Array[] = [];
    const now = new Set(ids);
    for (const id of present) {
      if (!now.has(id))
        packets.push(v1 ? createOscMessage('/au/personWillLeave', [id, 0, 0, { float: 0 }, { float: 0 }]) : createOscMessage('/object/leave', [frameNo, id, 0, { float: 0 }, { float: 0 }, { float: 0 }]));
    }
    hands.forEach((hand, index) => {
      const id = ids[index]!;
      const verb = present.has(id) ? 'update' : 'enter';
      packets.push(v1
        ? createOscMessage(verb === 'enter' ? '/au/personEntered' : '/au/personUpdated', [id, index, frameNo, nx(hand), ny(hand), { float: 0 }, { float: 0 }, { float: 0 }, nx(hand), ny(hand), { float: 0.02 }, { float: 0.03 }, nx(hand), ny(hand), { float: 1.7 }])
        : createOscMessage(`/object/${verb}`, [frameNo, id, index, { float: frameNo / 30 }, nx(hand), ny(hand), { float: 0 }, { float: 0 }, { float: 0 }, nx(hand), ny(hand), { float: 0.02 }, { float: 0.03 }, { float: 0 }, { float: 1.7 }]));
    });
    packets.push(v1 ? createOscMessage('/au/scene', [frameNo, { float: 0 }, hands.length, { float: 0 }, { float: 0 }, SENSOR_CANVAS.width, SENSOR_CANVAS.height, 100]) : createOscMessage('/scene', [frameNo, hands.length, { float: 4.608 }, { float: 2.688 }]));
    present = now;
    return packets;
  });
}
else if (mode === 'tuio') {
  runUdp('tuio-sim', 3333, (hands, frameNo, ids) => [createOscBundle([
    createOscMessage('/tuio/2Dcur', ['source', 'altama-sim']),
    createOscMessage('/tuio/2Dcur', ['alive', ...ids]),
    ...hands.map((hand, index) => createOscMessage('/tuio/2Dcur', ['set', ids[index]!, nx(hand), ny(hand), { float: 0 }, { float: 0 }, { float: 0 }])),
    createOscMessage('/tuio/2Dcur', ['fseq', frameNo]),
  ])]);
}
else {
  print('Usage: bun run sensor:sim <hokuyo|augmenta|tuio> [--tap x,y[,seconds]]… [--loop] [--port n] [--flip-y] [--v1] [--print-calibration]');
}
