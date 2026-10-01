import { createPinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { effectScope } from 'vue';
import { useWallController } from '../app/composables/useWallController';
import { useWallStore } from '../app/stores/wall';

const scopes: ReturnType<typeof effectScope>[] = [];
function setup() {
  const scope = effectScope();
  scopes.push(scope);
  const wall = useWallStore(createPinia());
  const controls = scope.run(() => useWallController(wall))!;
  return { wall, controls, scope };
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  scopes.splice(0).forEach(scope => scope.stop());
  vi.useRealTimers();
});

describe('column inactivity lifecycle', () => {
  it('resets an active column only after 15 seconds', () => {
    const { wall, controls } = setup();
    controls.dispatch({ type: 'main', columnId: 1 });
    vi.advanceTimersByTime(14999);
    expect(wall.getColumnState(1)).toBe('active');
    vi.advanceTimersByTime(1);
    expect(wall.getColumnState(1)).toBe('idle');
  });

  it('rearms locale-only idle timers after R/Escape', () => {
    const { wall, controls } = setup();
    controls.dispatch({ type: 'language', columnId: 1, locale: 'en' });
    vi.advanceTimersByTime(10000);
    controls.resetAll();
    vi.advanceTimersByTime(14999);
    expect(wall.getColumnLocale(1)).toBe('en');
    vi.advanceTimersByTime(1);
    expect(wall.getColumnLocale(1)).toBe('id');
  });

  it('rearms a locale-only timer when an operator closes a column', () => {
    const { wall, controls } = setup();
    controls.dispatch({ type: 'language', columnId: 2, locale: 'zh-Hans' });
    controls.dispatch({ type: 'main', columnId: 2 });
    controls.dispatch({ type: 'back', columnId: 2 });
    expect(wall.getColumnState(2)).toBe('idle');
    vi.advanceTimersByTime(15000);
    expect(wall.getColumnLocale(2)).toBe('id');
  });

  it('extends only the touched column timer', () => {
    const { wall, controls } = setup();
    controls.dispatch({ type: 'main', columnId: 1 });
    controls.dispatch({ type: 'main', columnId: 3 });
    vi.advanceTimersByTime(10000);
    controls.touchColumn(1);
    vi.advanceTimersByTime(5000);
    expect(wall.getColumnState(3)).toBe('idle');
    expect(wall.getColumnState(1)).toBe('active');
    vi.advanceTimersByTime(10000);
    expect(wall.getColumnState(1)).toBe('idle');
  });

  it('does not share timers between independent controller/store instances', () => {
    const first = setup();
    const second = setup();
    first.controls.dispatch({ type: 'main', columnId: 1 });
    vi.advanceTimersByTime(5000);
    second.controls.dispatch({ type: 'main', columnId: 1 });
    vi.advanceTimersByTime(10000);
    expect(first.wall.getColumnState(1)).toBe('idle');
    expect(second.wall.getColumnState(1)).toBe('active');
    vi.advanceTimersByTime(5000);
    expect(second.wall.getColumnState(1)).toBe('idle');
  });

  it('clears resources on scope disposal and ignores late actions', () => {
    const { wall, controls, scope } = setup();
    controls.dispatch({ type: 'main', columnId: 1 });
    scope.stop();
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(30000);
    expect(wall.getColumnState(1)).toBe('active');
    expect(controls.dispatch({ type: 'back', columnId: 1 })).toBe(false);
  });

  it('keeps default idle columns free of timers', () => {
    const { controls } = setup();
    controls.touchColumn(1);
    controls.resetAll();
    expect(vi.getTimerCount()).toBe(0);
  });
});
