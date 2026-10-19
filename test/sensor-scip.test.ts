import { describe, expect, it } from 'vitest';
import { decodeReply, decodeScipValue, encodeScanReply, encodeScipValue, mdCommand, parseParameters, scipChecksum, ScipStreamParser, statusLine, UST_10LX } from '../sensor-service/scip';

describe('sCIP 2.0 encoding', () => {
  it('computes the documented checksum and status lines', () => {
    expect(scipChecksum('00')).toBe('P');
    expect(scipChecksum('99')).toBe('b');
    expect(statusLine('00')).toBe('00P\n');
  });

  it('round-trips the 6-bit character encoding', () => {
    expect(decodeScipValue('1Dh')).toBe(5432);
    for (const value of [0, 1, 63, 64, 4095, 5432, 262_143])
      expect(decodeScipValue(encodeScipValue(value, 3))).toBe(value);
    expect(decodeScipValue(encodeScipValue(16_000_000, 4))).toBe(16_000_000);
  });

  it('formats a continuous MD command for the full UST-10LX range', () => {
    expect(mdCommand(UST_10LX.amin, UST_10LX.amax)).toBe('MD0000108001000\n');
  });
});

describe('sCIP stream parser', () => {
  const ranges = Array.from({ length: 1081 }, (_, i) => (i * 37) % 9000);
  const echo = 'MD0000108001000';

  it('decodes a full scan split across arbitrary TCP chunks', () => {
    const wire = `${echo}\n${statusLine('00')}\n${encodeScanReply(echo, ranges, 123_456)}`;
    const parser = new ScipStreamParser();
    const events = [];
    for (let i = 0; i < wire.length; i += 97)
      events.push(...parser.push(wire.slice(i, i + 97)));
    expect(events[0]).toMatchObject({ type: 'reply', command: 'MD', status: '00' });
    expect(events[1]).toMatchObject({ type: 'scan', command: 'MD', timestamp: 123_456 });
    expect(events[1]!.type === 'scan' && events[1]!.ranges).toEqual(ranges);
  });

  it('tolerates CRLF line endings', () => {
    const wire = encodeScanReply(echo, ranges.slice(0, 10), 5).replace(/\n/g, '\r\n');
    const [event] = new ScipStreamParser().push(wire);
    expect(event).toMatchObject({ type: 'scan', ranges: ranges.slice(0, 10) });
  });

  it('rejects corrupted data blocks instead of emitting wrong ranges', () => {
    const lines = encodeScanReply(echo, ranges, 9).split('\n');
    lines[4] = `${lines[4]!.slice(0, 10)}~${lines[4]!.slice(11)}`;
    expect(decodeReply(lines.filter(Boolean))).toEqual({ type: 'error', command: 'MD', error: 'data checksum' });
  });

  it('reports non-data replies with their status', () => {
    expect(decodeReply(['MD0000108001000', '0Ee'])).toMatchObject({ type: 'reply', command: 'MD', status: '0E' });
  });

  it('reads scan parameters from PP', () => {
    const params = parseParameters(['MODL:UST-10LX;X', 'AMIN:0;?', 'AMAX:1080;?', 'AFRT:540;?', 'ARES:1440;?', 'SCAN:2400;?']);
    expect(params).toEqual({ amin: 0, amax: 1080, afrt: 540, ares: 1440, scanRate: 40 });
    expect(parseParameters([])).toEqual(UST_10LX);
  });
});
