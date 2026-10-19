/// <reference types="@types/bun" />
/**
 * `bun dev`: Nuxt dev server (wall + /dashboard) and the Sensor Service (WebSocket 8787, OSC 9000)
 * in one terminal. Nuxt keeps the terminal (its r/o/q shortcuts work); service lines are prefixed
 * with [sensor]. When a Sensor Service already listens on WS_PORT, it is reused instead. Ctrl+C or
 * quitting Nuxt stops both. `bun run dev:web` starts Nuxt alone.
 */
import net from 'node:net';
import process from 'node:process';

const WS_PORT = Number.parseInt(process.env.WS_PORT || '8787', 10);

function portInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.connect({ host: '127.0.0.1', port });
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', () => resolve(false));
  });
}

async function pipePrefixed(stream: ReadableStream<Uint8Array>, prefix: string) {
  const decoder = new TextDecoder();
  let pending = '';
  for await (const chunk of stream) {
    pending += decoder.decode(chunk, { stream: true });
    const lines = pending.split(/\r?\n/);
    pending = lines.pop() ?? '';
    for (const line of lines)
      process.stdout.write(`${prefix} ${line}\n`);
  }
  if (pending)
    process.stdout.write(`${prefix} ${pending}\n`);
}

let sensor: ReturnType<typeof Bun.spawn> | null = null;
if (await portInUse(WS_PORT)) {
  console.log(`[sensor] port ${WS_PORT} is already in use: using the Sensor Service that is running.`);
}
else {
  sensor = Bun.spawn(['bun', 'sensor-service/main.ts'], { stdout: 'pipe', stderr: 'pipe', env: process.env });
  void pipePrefixed(sensor.stdout as ReadableStream<Uint8Array>, '\x1B[36m[sensor]\x1B[0m');
  void pipePrefixed(sensor.stderr as ReadableStream<Uint8Array>, '\x1B[31m[sensor]\x1B[0m');
}

const nuxt = Bun.spawn(['bunx', 'nuxt', 'dev', ...process.argv.slice(2)], { stdio: ['inherit', 'inherit', 'inherit'], env: process.env });

function stopAll(code = 0) {
  sensor?.kill();
  nuxt.kill();
  process.exit(code);
}
process.on('SIGINT', () => stopAll(0));
process.on('SIGTERM', () => stopAll(0));

void sensor?.exited.then((code) => {
  if (code !== 0)
    console.log(`[sensor] stopped (exit ${code}); the wall keeps running. Restart it with: bun run sensor:service`);
});
stopAll(await nuxt.exited);
