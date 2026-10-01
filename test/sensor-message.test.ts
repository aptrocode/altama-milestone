import { createPinia } from 'pinia';
import { describe, expect, it } from 'vitest';
import { effectScope } from 'vue';
import { useWallController } from '../app/composables/useWallController';
import { useWallStore } from '../app/stores/wall';
import { parseSensorMessage } from '../app/utils/sensor-message';
import { COLUMN_IDS } from '../shared/wall';
import { sensorInput } from './helpers';

describe('sensor protocol v2 and shared action routing', () => {
  it.each(COLUMN_IDS)('opens column %i and switches only its language through parsed input', (columnId) => {
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
        { type: 'main', columnId: 2 },
        { type: 'subItem', columnId: 2, subItemId: 'ryu' },
        { type: 'next', columnId: 2 },
        { type: 'back', columnId: 2 },
      ] as const;
      for (const action of actions) {
        const parsed = parseSensorMessage(sensorInput(action));
        expect(parsed.ok).toBe(true);
        if (parsed.ok && parsed.message.type === 'input')
          expect(controls.dispatch(parsed.message.action)).toBe(true);
      }
      expect(wall.columns[2]).toMatchObject({ phase: 'submenu', subItem: 'ryu', slide: 0 });
    }
    finally { scope.stop(); }
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
