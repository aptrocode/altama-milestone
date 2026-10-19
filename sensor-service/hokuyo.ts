import type { ScanParameters } from './scip';
import net from 'node:net';
import { mdCommand, parseParameters, ScipStreamParser, UST_10LX } from './scip';

export interface HokuyoStatus {
  connected: boolean;
  /** Scans arrived within the watchdog window. */
  streaming: boolean;
  scanRate: number;
  error: string;
}

export interface HokuyoClientOptions {
  host: string;
  port: number;
  onScan: (ranges: number[], params: ScanParameters) => void;
  onStatus: (status: HokuyoStatus) => void;
  /** Reconnect when no scan arrives for this long. */
  watchdogMs?: number;
  log?: (text: string) => void;
}

const RECONNECT_DELAYS = [1_000, 2_000, 4_000, 5_000] as const;

/**
 * UST-10LX over Ethernet: reads PP (scan parameters), streams MD distance scans, and reconnects with
 * backoff when the link drops or scans stop.
 */
export class HokuyoClient {
  private readonly options: HokuyoClientOptions;
  private socket: net.Socket | null = null;
  private readonly parser = new ScipStreamParser();
  private params: ScanParameters = UST_10LX;
  private stopped = true;
  private attempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private watchdog: ReturnType<typeof setInterval> | null = null;
  private ppTimer: ReturnType<typeof setTimeout> | null = null;
  private lastScanAt = 0;
  private scanTimes: number[] = [];
  private status: HokuyoStatus = { connected: false, streaming: false, scanRate: 0, error: '' };

  constructor(options: HokuyoClientOptions) {
    this.options = options;
  }

  start() {
    this.stop();
    this.stopped = false;
    this.attempt = 0;
    this.connect();
    this.watchdog = setInterval(() => this.checkWatchdog(), 500);
  }

  stop() {
    this.stopped = true;
    if (this.reconnectTimer)
      clearTimeout(this.reconnectTimer);
    if (this.watchdog)
      clearInterval(this.watchdog);
    if (this.ppTimer)
      clearTimeout(this.ppTimer);
    this.reconnectTimer = null;
    this.watchdog = null;
    this.ppTimer = null;
    this.closeSocket(true);
    this.setStatus({ connected: false, streaming: false, scanRate: 0, error: '' });
  }

  private setStatus(next: Partial<HokuyoStatus>) {
    const merged = { ...this.status, ...next };
    if (JSON.stringify(merged) === JSON.stringify(this.status))
      return;
    this.status = merged;
    this.options.onStatus(merged);
  }

  private closeSocket(sendQuit: boolean) {
    const socket = this.socket;
    this.socket = null;
    if (!socket)
      return;
    socket.removeAllListeners();
    socket.on('error', () => {});
    if (sendQuit && socket.writable) {
      socket.end('QT\n');
      setTimeout(() => socket.destroy(), 300);
      return;
    }
    socket.destroy();
  }

  private connect() {
    if (this.stopped)
      return;
    this.parser.reset();
    this.scanTimes = [];
    const socket = net.createConnection({ host: this.options.host, port: this.options.port });
    this.socket = socket;
    socket.setNoDelay(true);
    socket.setTimeout(3_000, () => this.fail('connect timeout'));

    socket.on('connect', () => {
      socket.setTimeout(0);
      socket.setKeepAlive(true, 1_000);
      this.attempt = 0;
      this.lastScanAt = Date.now();
      this.setStatus({ connected: true, error: '' });
      this.options.log?.(`[Hokuyo] connected ${this.options.host}:${this.options.port}`);
      // Stop any stream left by a previous client, then read the scan parameters before streaming.
      socket.write('QT\nPP\n');
      this.ppTimer = setTimeout(() => this.startStream(), 1_000);
    });
    socket.on('data', chunk => this.handleData(chunk.toString('latin1')));
    socket.on('error', error => this.fail(error.message));
    socket.on('close', () => this.fail('connection closed'));
  }

  private startStream() {
    if (this.ppTimer)
      clearTimeout(this.ppTimer);
    this.ppTimer = null;
    this.socket?.write(mdCommand(this.params.amin, this.params.amax));
  }

  private handleData(text: string) {
    for (const event of this.parser.push(text)) {
      if (event.type === 'scan') {
        const now = Date.now();
        this.lastScanAt = now;
        this.scanTimes.push(now);
        while (this.scanTimes.length && now - this.scanTimes[0]! > 1_000)
          this.scanTimes.shift();
        if (!this.status.streaming)
          this.setStatus({ streaming: true, error: '' });
        this.options.onScan(event.ranges, this.params);
      }
      else if (event.type === 'reply' && event.command === 'PP' && event.status === '00') {
        this.params = parseParameters(event.lines);
        if (this.ppTimer)
          this.startStream();
      }
      else if (event.type === 'reply' && event.command === 'MD' && event.status !== '00') {
        this.setStatus({ error: `MD status ${event.status}` });
      }
      else if (event.type === 'error') {
        this.options.log?.(`[Hokuyo] ${event.error}`);
      }
    }
  }

  private checkWatchdog() {
    if (!this.socket || !this.status.connected)
      return;
    const now = Date.now();
    while (this.scanTimes.length && now - this.scanTimes[0]! > 1_000)
      this.scanTimes.shift();
    // Rate is reported twice a second, not per scan, so status traffic stays small.
    this.setStatus({ scanRate: this.scanTimes.length });
    const silent = now - this.lastScanAt;
    if (silent > 1_000 && this.status.streaming)
      this.setStatus({ streaming: false, scanRate: 0 });
    if (silent > (this.options.watchdogMs ?? 3_000))
      this.fail('no scans');
  }

  private fail(reason: string) {
    if (this.stopped || !this.socket)
      return;
    this.options.log?.(`[Hokuyo] ${reason}`);
    this.closeSocket(false);
    if (this.ppTimer)
      clearTimeout(this.ppTimer);
    this.ppTimer = null;
    this.setStatus({ connected: false, streaming: false, scanRate: 0, error: reason });
    const delay = RECONNECT_DELAYS[Math.min(this.attempt++, RECONNECT_DELAYS.length - 1)]!;
    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }
}
