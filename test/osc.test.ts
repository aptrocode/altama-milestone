import { describe, expect, it } from 'vitest';
import { createOscMessage, oscToWallActions, parseOscPacket } from '../shared/osc';

describe('osc encoding, parsing, and WallAction translation', () => {
  it('encodes and parses single OSC message with integer and string arguments', () => {
    const raw = createOscMessage('/altama/column', [1]);
    const parsed = parseOscPacket(raw);
    expect(parsed).toHaveLength(1);
    expect(parsed[0]!.address).toBe('/altama/column');
    expect(parsed[0]!.args).toEqual([1]);
  });

  it('encodes and parses string and float arguments', () => {
    const raw = createOscMessage('/altama/subItem', [2, 'tekiro']);
    const parsed = parseOscPacket(raw);
    expect(parsed).toHaveLength(1);
    expect(parsed[0]!.address).toBe('/altama/subItem');
    expect(parsed[0]!.args).toEqual([2, 'tekiro']);
  });

  it('translates /altama/column to toggle main/back actions', () => {
    const actionsIdle = oscToWallActions({
      address: '/altama/column',
      types: ',i',
      args: [1],
    });
    expect(actionsIdle).toEqual([{ type: 'main', columnId: 1 }]);

    const actionsActive = oscToWallActions(
      { address: '/altama/column', types: ',i', args: [1] },
      {
        1: { phase: 'active', locale: 'id', subItem: '', slide: 0 },
        2: { phase: 'idle', locale: 'id', subItem: '', slide: 0 },
        3: { phase: 'idle', locale: 'id', subItem: '', slide: 0 },
        4: { phase: 'idle', locale: 'id', subItem: '', slide: 0 },
        5: { phase: 'idle', locale: 'id', subItem: '', slide: 0 },
        6: { phase: 'idle', locale: 'id', subItem: '', slide: 0 },
      },
    );
    expect(actionsActive).toEqual([{ type: 'back', columnId: 1 }]);
  });

  it('translates /altama/col/3 pattern', () => {
    const actions = oscToWallActions({
      address: '/altama/col/3',
      types: '',
      args: [],
    });
    expect(actions).toEqual([{ type: 'main', columnId: 3 }]);
  });

  it('translates carousel next and previous controls', () => {
    expect(oscToWallActions({ address: '/altama/next', types: ',i', args: [4] })).toEqual([{ type: 'next', columnId: 4 }]);
    expect(oscToWallActions({ address: '/altama/prev', types: ',i', args: [4] })).toEqual([{ type: 'previous', columnId: 4 }]);
  });

  it('translates language switcher for single or all columns', () => {
    expect(oscToWallActions({ address: '/altama/lang', types: ',is', args: [2, 'en'] })).toEqual([
      { type: 'language', columnId: 2, locale: 'en' },
    ]);
    const allEn = oscToWallActions({ address: '/altama/lang', types: ',s', args: ['zh'] });
    expect(allEn).toHaveLength(6);
    expect(allEn[0]).toEqual({ type: 'language', columnId: 1, locale: 'zh-Hans' });
  });

  it('translates /altama/reset to back actions for active columns', () => {
    const actions = oscToWallActions(
      { address: '/altama/reset', types: '', args: [] },
      {
        1: { phase: 'idle', locale: 'id', subItem: '', slide: 0 },
        2: { phase: 'submenu', locale: 'id', subItem: '', slide: 0 },
        3: { phase: 'idle', locale: 'id', subItem: '', slide: 0 },
        4: { phase: 'idle', locale: 'id', subItem: '', slide: 0 },
        5: { phase: 'active', locale: 'id', subItem: '', slide: 1 },
        6: { phase: 'idle', locale: 'id', subItem: '', slide: 0 },
      },
    );
    expect(actions).toEqual([
      { type: 'back', columnId: 2 },
      { type: 'back', columnId: 5 },
    ]);
  });
});
