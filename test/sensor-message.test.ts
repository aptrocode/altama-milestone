import { describe, expect, it } from 'vitest';
import { parseSensorMessage } from '../app/utils/sensor-message';

function message(overrides: Record<string, unknown> = {}) {
  return JSON.stringify({
    version: 1,
    sessionId: 'service-boot-1',
    seq: 1,
    layoutVersion: 'layout-v4',
    type: 'touchStart',
    section: 'center',
    target: 'artwork',
    pointerId: 'lidar-02',
    x: 1120,
    y: 650,
    ...overrides,
  });
}

describe('parseSensorMessage', () => {
  it('accepts a valid touchStart', () => {
    const result = parseSensorMessage(message());

    expect(result.ok).toBe(true);
    if (result.ok)
      expect(result.message.type).toBe('touchStart');
  });

  it('rejects malformed JSON and unsupported versions', () => {
    expect(parseSensorMessage('{').ok).toBe(false);
    expect(parseSensorMessage(message({ version: 2 })).ok).toBe(false);
  });

  it('rejects coordinates outside the logical canvas', () => {
    const result = parseSensorMessage(message({ x: 9999 }));

    expect(result).toEqual({ ok: false, error: 'coordinates are outside the logical canvas' });
  });

  it('accepts status messages without interaction fields', () => {
    const result = parseSensorMessage(message({
      type: 'status',
      sensorReady: true,
      calibrated: false,
      detail: 'warming up',
    }));

    expect(result.ok).toBe(true);
    if (result.ok && result.message.type === 'status')
      expect(result.message.calibrated).toBe(false);
  });

  it('accepts a section language selection and rejects unsupported languages', () => {
    const valid = parseSensorMessage(message({
      type: 'selectLanguage',
      locale: 'zh-Hans',
      x: 1152,
      y: 1050,
    }));
    expect(valid.ok).toBe(true);
    if (valid.ok && valid.message.type === 'selectLanguage') {
      expect(valid.message.section).toBe('center');
      expect(valid.message.locale).toBe('zh-Hans');
    }

    expect(parseSensorMessage(message({ type: 'selectLanguage', locale: 'fr' })))
      .toEqual({ ok: false, error: 'unsupported locale' });
  });
});
