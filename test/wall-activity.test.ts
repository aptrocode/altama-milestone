import { createPinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { effectScope } from 'vue';
import { useWallController } from '../app/composables/useWallController';
import { useWallStore } from '../app/stores/wall';
import { isWallPointerActivity } from '../app/utils/wall-activity';

function pointer(isTrusted = false, button: { disabled: boolean; getAttribute: (name: string) => string | null } | null = null) {
  return { isTrusted, target: Object.assign(new EventTarget(), { closest: () => button }) };
}

describe('wall pointer activity', () => {
  it('keeps native touches on card copy as visitor activity', () => {
    expect(isWallPointerActivity(pointer(true))).toBe(true);
  });

  it('ignores synthetic presses on passive copy, photos and non-element targets', () => {
    expect(isWallPointerActivity(pointer())).toBe(false);
    expect(isWallPointerActivity({ isTrusted: false, target: null })).toBe(false);
    expect(isWallPointerActivity({ isTrusted: false, target: new EventTarget() })).toBe(false);
  });

  it('keeps TouchDesigner presses on enabled wall buttons', () => {
    expect(isWallPointerActivity(pointer(false, { disabled: false, getAttribute: () => null }))).toBe(true);
  });

  it('ignores synthetic presses on disabled buttons', () => {
    expect(isWallPointerActivity(pointer(false, { disabled: true, getAttribute: () => null }))).toBe(false);
    expect(isWallPointerActivity(pointer(false, { disabled: false, getAttribute: () => 'true' }))).toBe(false);
  });
});

describe('touchdesigner pemasaran inactivity', () => {
  const scopes: ReturnType<typeof effectScope>[] = [];
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    scopes.splice(0).forEach(scope => scope.stop());
    vi.useRealTimers();
  });

  function open() {
    const wall = useWallStore(createPinia());
    const scope = effectScope();
    scopes.push(scope);
    const controls = scope.run(() => useWallController(wall, { autoSlideMs: () => 5000 }))!;
    controls.dispatch({ type: 'subItem', columnId: 5, subItemId: 'pemasaran' });
    return { wall, controls };
  }

  it('resets after the slideshow despite repeated synthetic contacts on passive content', () => {
    const { wall, controls } = open();
    for (let seconds = 0; seconds < 45; seconds++) {
      if (isWallPointerActivity(pointer()))
        controls.touchColumn(5);
      vi.advanceTimersByTime(1000);
    }
    expect(wall.columns[5]).toMatchObject({ phase: 'idle', locale: 'id', subItem: 'distribusi' });
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(['native', 'TouchDesigner'])('still extends the deadline for an enabled %s visitor press', (source) => {
    const { wall, controls } = open();
    vi.advanceTimersByTime(25_000);
    const event = source === 'native' ? pointer(true) : pointer(false, { disabled: false, getAttribute: () => null });
    if (isWallPointerActivity(event))
      controls.touchColumn(5);
    vi.advanceTimersByTime(29_999);
    expect(wall.getColumnState(5)).toBe('active');
    vi.advanceTimersByTime(1);
    expect(wall.getColumnState(5)).toBe('idle');
  });
});
