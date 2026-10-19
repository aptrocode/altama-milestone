/**
 * Hokuyo SCIP 2.0 (UST-10LX over TCP 10940). Commands and replies are LF-terminated lines; a reply ends
 * with an empty line. Every reply line after the echo carries a one-character checksum:
 * ((sum of the line's bytes) & 0x3f) + 0x30. Distances use the three-character 6-bit encoding.
 */

/** UST-10LX defaults; the client reads the real values from PP when available. */
export interface ScanParameters {
  /** First/last measurable step, front step, and steps per full turn. */
  amin: number;
  amax: number;
  afrt: number;
  ares: number;
  /** Nominal scans per second. */
  scanRate: number;
}

export const UST_10LX: ScanParameters = { amin: 0, amax: 1080, afrt: 540, ares: 1440, scanRate: 40 };

export function scipChecksum(text: string): string {
  let sum = 0;
  for (let i = 0; i < text.length; i++)
    sum += text.charCodeAt(i);
  return String.fromCharCode((sum & 0x3F) + 0x30);
}

export function decodeScipValue(text: string): number {
  let value = 0;
  for (let i = 0; i < text.length; i++)
    value = value * 64 + (text.charCodeAt(i) - 0x30);
  return value;
}

export function encodeScipValue(value: number, width: number): string {
  let out = '';
  let rest = Math.max(0, Math.floor(value));
  for (let i = 0; i < width; i++) {
    out = String.fromCharCode((rest & 0x3F) + 0x30) + out;
    rest = Math.floor(rest / 64);
  }
  return out;
}

function pad(value: number, width: number): string {
  return String(Math.max(0, Math.floor(value))).padStart(width, '0');
}

/** MD (continuous distance stream). scans 0 = until QT. */
export function mdCommand(start: number, end: number, cluster = 1, interval = 0, scans = 0): string {
  return `MD${pad(start, 4)}${pad(end, 4)}${pad(cluster, 2)}${pad(interval, 1)}${pad(scans, 2)}\n`;
}

/** Splits payload into lines of at most 64 characters, each followed by its checksum (SCIP data block). */
export function encodeDataBlocks(payload: string): string {
  let out = '';
  for (let i = 0; i < payload.length; i += 64) {
    const block = payload.slice(i, i + 64);
    out += `${block}${scipChecksum(block)}\n`;
  }
  return out;
}

export function statusLine(status: string): string {
  return `${status}${scipChecksum(status)}\n`;
}

/** Builds one MD/GD data reply exactly as the sensor sends it (used by simulators and tests). */
export function encodeScanReply(echo: string, ranges: number[], timestamp: number, status = '99'): string {
  const time = encodeScipValue(timestamp, 4);
  return `${echo}\n${statusLine(status)}${time}${scipChecksum(time)}\n${encodeDataBlocks(ranges.map(range => encodeScipValue(range, 3)).join(''))}\n`;
}

export type ScipEvent
  = | { type: 'scan'; command: string; timestamp: number; ranges: number[] }
    | { type: 'reply'; command: string; status: string; lines: string[] }
    | { type: 'error'; command: string; error: string };

/** Line-oriented checksum validator for status/data lines (last char is the checksum). */
function checked(line: string): string | null {
  if (line.length < 1)
    return null;
  const body = line.slice(0, -1);
  return scipChecksum(body) === line.slice(-1) ? body : null;
}

/** Decodes one complete reply (lines without the trailing empty line). */
export function decodeReply(lines: string[]): ScipEvent {
  const echo = lines[0] ?? '';
  const command = echo.slice(0, 2);
  const statusRaw = lines[1];
  if (statusRaw === undefined)
    return { type: 'reply', command, status: '', lines: [] };
  // A few legacy replies ("00" without checksum) are tolerated; status is the first two characters.
  const status = statusRaw.length >= 3 ? checked(statusRaw) ?? '' : statusRaw;
  if (!status)
    return { type: 'error', command, error: 'status checksum' };

  const isData = (command === 'MD' && status === '99') || ((command === 'GD' || command === 'GS') && status === '00');
  if (!isData || lines.length < 3)
    return { type: 'reply', command, status, lines: lines.slice(2) };

  const time = checked(lines[2]!);
  if (time === null || time.length !== 4)
    return { type: 'error', command, error: 'timestamp checksum' };
  let payload = '';
  for (const line of lines.slice(3)) {
    const block = checked(line);
    if (block === null)
      return { type: 'error', command, error: 'data checksum' };
    payload += block;
  }
  const width = command === 'GS' ? 2 : 3;
  if (payload.length % width !== 0)
    return { type: 'error', command, error: 'data length' };
  const ranges: number[] = [];
  for (let i = 0; i < payload.length; i += width)
    ranges.push(decodeScipValue(payload.slice(i, i + width)));
  return { type: 'scan', command, timestamp: decodeScipValue(time), ranges };
}

/** Parses PP reply lines such as `AMIN:0;?` into a ScanParameters overlay. */
export function parseParameters(lines: string[], fallback: ScanParameters = UST_10LX): ScanParameters {
  const values = new Map<string, number>();
  for (const line of lines) {
    const match = /^(\w+):([^;]*);/.exec(line);
    if (match)
      values.set(match[1]!, Number.parseInt(match[2]!, 10));
  }
  const read = (key: string, value: number) => {
    const parsed = values.get(key);
    return parsed !== undefined && Number.isFinite(parsed) && parsed > 0 ? parsed : value;
  };
  const scanRpm = read('SCAN', fallback.scanRate * 60);
  return {
    amin: values.has('AMIN') && Number.isFinite(values.get('AMIN')) ? values.get('AMIN')! : fallback.amin,
    amax: read('AMAX', fallback.amax),
    afrt: read('AFRT', fallback.afrt),
    ares: read('ARES', fallback.ares),
    scanRate: scanRpm / 60,
  };
}

/** Accumulates a TCP byte stream and emits one event per complete reply. */
export class ScipStreamParser {
  private buffer = '';
  private readonly maxBuffer: number;

  constructor(maxBuffer = 1 << 20) {
    this.maxBuffer = maxBuffer;
  }

  push(chunk: string): ScipEvent[] {
    this.buffer += chunk.replace(/\r/g, '');
    const events: ScipEvent[] = [];
    let end = this.buffer.indexOf('\n\n');
    while (end !== -1) {
      const block = this.buffer.slice(0, end).replace(/^\n+/, '');
      this.buffer = this.buffer.slice(end + 2);
      if (block.length > 0)
        events.push(decodeReply(block.split('\n')));
      end = this.buffer.indexOf('\n\n');
    }
    if (this.buffer.length > this.maxBuffer) {
      this.buffer = '';
      events.push({ type: 'error', command: '', error: 'buffer overflow' });
    }
    return events;
  }

  reset() {
    this.buffer = '';
  }
}
