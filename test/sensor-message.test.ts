import { createPinia } from 'pinia';
import { describe, expect, it } from 'vitest';
import { effectScope } from 'vue';
import { useWallController } from '../app/composables/useWallController';
import { useWallStore } from '../app/stores/wall';
import { parseSensorMessage } from '../app/utils/sensor-message';
import { COLUMN_IDS } from '../shared/wall';
import { sensorInput } from './helpers';

describe('sensor protocol v2 and shared action routing', () => {
  it.each([1, 3, 4, 6] as const)('opens column %i and switches only its language through parsed input', (columnId) => {
    const scope = effectScope();
    const wall = useWallStore(createPinia());
    const controls = scope.run(() => useWallController(wall))!;
    try {
      for (const action of [{ type: 'language', columnId, locale: 'zh-Hans' }, { type: 'main', columnId }] as const) {
        const parsed = parseSensorMessage(sensorInput(action));
        expect(parsed.ok).toBe(true);
        if (parsed.ok && parsed.message.type === 'input')
          expect(controls.dispatch(parsed.message.action)).toBe(true);
      }
      expect(wall.getColumnState(columnId)).not.toBe('idle');
      expect(wall.getColumnLocale(columnId)).toBe('zh-Hans');
      COLUMN_IDS.filter(id => id !== columnId).forEach(id => expect(wall.getColumnLocale(id)).toBe('id'));
    }
    finally { scope.stop(); }
  });

  it('routes sub-item, carousel, and back actions through the same controller', () => {
    const scope = effectScope();
    const wall = useWallStore(createPinia());
    const controls = scope.run(() => useWallController(wall))!;
    try {
      const actions = [
        { type: 'subItem', columnId: 2, subItemId: 'tekiro' },
        { type: 'next', columnId: 2 },
        { type: 'page', columnId: 2, page: 1 },
      ] as const;
      for (const action of actions) {
        const parsed = parseSensorMessage(sensorInput(action));
        expect(parsed.ok).toBe(true);
        if (parsed.ok && parsed.message.type === 'input')
          expect(controls.dispatch(parsed.message.action)).toBe(true);
      }
      expect(wall.columns[2]).toMatchObject({ phase: 'active', subItem: 'tekiro', photo: 0, page: 1 });
      const back = parseSensorMessage(sensorInput({ type: 'back', columnId: 2 }));
      expect(back.ok && back.message.type === 'input' && controls.dispatch(back.message.action)).toBe(true);
      expect(wall.getColumnState(2)).toBe('idle');
    }
    finally { scope.stop(); }
  });

  it('has no main target for brand/distribution columns, whose tiles are the targets', () => {
    for (const columnId of [2, 5] as const) {
      const tile = parseSensorMessage(sensorInput({ type: 'subItem', columnId, subItemId: columnId === 2 ? 'rexco' : 'pemasaran' }));
      expect(tile.ok).toBe(true);
      const point = JSON.parse(sensorInput({ type: 'subItem', columnId, subItemId: columnId === 2 ? 'rexco' : 'pemasaran' }));
      expect(parseSensorMessage(sensorInput({ type: 'main', columnId: 1 }, { action: { type: 'main', columnId }, x: point.x, y: point.y })).ok).toBe(false);
    }
  });

  it('rejects page tabs outside the declared tab targets', () => {
    expect(parseSensorMessage(sensorInput({ type: 'page', columnId: 1, page: 1 })).ok).toBe(true);
    const tab = JSON.parse(sensorInput({ type: 'page', columnId: 1, page: 0 }));
    expect(parseSensorMessage(sensorInput({ type: 'page', columnId: 1, page: 1 }, { x: tab.x })).ok).toBe(false);
    expect(parseSensorMessage(sensorInput({ type: 'page', columnId: 1, page: 0 }, { action: { type: 'page', columnId: 1, page: -1 } })).ok).toBe(false);
  });

  it('rejects malformed data, old protocol, unknown columns, and unknown actions', () => {
    expect(parseSensorMessage('{').ok).toBe(false);
    expect(parseSensorMessage(sensorInput({ type: 'main', columnId: 1 }, { version: 1 })).ok).toBe(false);
    for (const action of [{ type: 'main', columnId: 7 }, { type: 'other', columnId: 1 }, { type: 'language', columnId: 1, locale: 'fr' }, { type: 'subItem', columnId: 5, subItemId: 'ryu' }])
      expect(parseSensorMessage(sensorInput({ type: 'main', columnId: 1 }, { action })).ok).toBe(false);
  });

  it('rejects out-of-canvas and wrong-target coordinates', () => {
    expect(parseSensorMessage(sensorInput({ type: 'main', columnId: 1 }, { x: 2304 })).ok).toBe(false);
    const columnSixPoint = JSON.parse(sensorInput({ type: 'main', columnId: 6 }));
    expect(parseSensorMessage(sensorInput({ type: 'main', columnId: 1 }, { x: columnSixPoint.x })).ok).toBe(false);
    const idFlag = JSON.parse(sensorInput({ type: 'language', columnId: 1, locale: 'id' }));
    expect(parseSensorMessage(sensorInput({ type: 'language', columnId: 1, locale: 'en' }, { x: idFlag.x })).ok).toBe(false);
  });

  it('does not route an idle language overlay contact to the underlying main action', () => {
    const flag = JSON.parse(sensorInput({ type: 'language', columnId: 1, locale: 'en' }));
    expect(parseSensorMessage(sensorInput({ type: 'main', columnId: 1 }, { x: flag.x, y: flag.y })).ok).toBe(false);
    // Padding/gaps of the floating group are also occluded in the browser.
    expect(parseSensorMessage(sensorInput({ type: 'main', columnId: 1 }, { x: flag.x - 30, y: flag.y })).ok).toBe(false);
    expect(parseSensorMessage(sensorInput({ type: 'language', columnId: 1, locale: 'en' })).ok).toBe(true);
  });
});
