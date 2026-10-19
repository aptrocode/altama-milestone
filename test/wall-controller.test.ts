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
  it('resets an active column only after 30 seconds', () => {
    const { wall, controls } = setup();
    controls.dispatch({ type: 'main', columnId: 1 });
    vi.advanceTimersByTime(29999);
    expect(wall.getColumnState(1)).toBe('active');
    vi.advanceTimersByTime(1);
    expect(wall.getColumnState(1)).toBe('idle');
  });

  it('uses the dashboard reset time, read when each timer starts', () => {
    const wall = useWallStore(createPinia());
    let seconds = 10;
    const scope = effectScope();
    scopes.push(scope);
    const controls = scope.run(() => useWallController(wall, { resetDelayMs: () => seconds * 1000 }))!;
    controls.dispatch({ type: 'main', columnId: 1 });
    vi.advanceTimersByTime(9999);
    expect(wall.getColumnState(1)).toBe('active');
    vi.advanceTimersByTime(1);
    expect(wall.getColumnState(1)).toBe('idle');
    seconds = 45;
    controls.dispatch({ type: 'main', columnId: 1 });
    vi.advanceTimersByTime(44999);
    expect(wall.getColumnState(1)).toBe('active');
    vi.advanceTimersByTime(1);
    expect(wall.getColumnState(1)).toBe('idle');
  });

  it('rearms locale-only idle timers after R/Escape', () => {
    const { wall, controls } = setup();
    controls.dispatch({ type: 'language', columnId: 1, locale: 'en' });
    vi.advanceTimersByTime(10000);
    controls.resetAll();
    vi.advanceTimersByTime(29999);
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
    vi.advanceTimersByTime(30000);
    expect(wall.getColumnLocale(2)).toBe('id');
  });

  it('extends only the touched column timer', () => {
    const { wall, controls } = setup();
    controls.dispatch({ type: 'main', columnId: 1 });
    controls.dispatch({ type: 'main', columnId: 3 });
    vi.advanceTimersByTime(20000);
    controls.touchColumn(1);
    vi.advanceTimersByTime(10000);
    expect(wall.getColumnState(3)).toBe('idle');
    expect(wall.getColumnState(1)).toBe('active');
    vi.advanceTimersByTime(20000);
    expect(wall.getColumnState(1)).toBe('idle');
  });

  it('does not share timers between independent controller/store instances', () => {
    const first = setup();
    const second = setup();
    first.controls.dispatch({ type: 'main', columnId: 1 });
    vi.advanceTimersByTime(10000);
    second.controls.dispatch({ type: 'main', columnId: 1 });
    vi.advanceTimersByTime(20000);
    expect(first.wall.getColumnState(1)).toBe('idle');
    expect(second.wall.getColumnState(1)).toBe('active');
    vi.advanceTimersByTime(10000);
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

describe('photo auto slide', () => {
  function open(autoSlideMs: () => number) {
    const wall = useWallStore(createPinia());
    const scope = effectScope();
    scopes.push(scope);
    const controls = scope.run(() => useWallController(wall, { autoSlideMs }))!;
    // Column 1 opens on a page with several photos.
    controls.dispatch({ type: 'main', columnId: 1 });
    expect(wall.publishedColumns[1]!.photoCount).toBeGreaterThan(1);
    return { wall, controls };
  }

  it('advances open cards every interval and restarts after a manual change', () => {
    const { wall, controls } = open(() => 5000);
    vi.advanceTimersByTime(4999);
    expect(wall.publishedColumns[1]!.photo).toBe(0);
    vi.advanceTimersByTime(1);
    expect(wall.publishedColumns[1]!.photo).toBe(1);
    vi.advanceTimersByTime(3000);
    controls.dispatch({ type: 'previous', columnId: 1 });
    vi.advanceTimersByTime(4999);
    expect(wall.publishedColumns[1]!.photo).toBe(0);
    vi.advanceTimersByTime(1);
    expect(wall.publishedColumns[1]!.photo).toBe(1);
  });

  it('does not count as activity: the reset still closes the card', () => {
    const { wall } = open(() => 5000);
    vi.advanceTimersByTime(29999);
    expect(wall.getColumnState(1)).toBe('active');
    vi.advanceTimersByTime(1);
    expect(wall.getColumnState(1)).toBe('idle');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('stays off while the interval is 0 (arrows shown)', () => {
    const { wall } = open(() => 0);
    vi.advanceTimersByTime(20000);
    expect(wall.publishedColumns[1]!.photo).toBe(0);
  });
});
