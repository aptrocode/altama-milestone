import type { ColumnId } from '../shared/wall';
import { createPinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { effectScope, ref } from 'vue';
import { MAX_RESET_WAIT_MS, useWallController } from '../app/composables/useWallController';
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
  function open(autoSlideMs: () => number, slidePlaysToEnd?: (id: ColumnId) => boolean) {
    const wall = useWallStore(createPinia());
    const scope = effectScope();
    scopes.push(scope);
    const controls = scope.run(() => useWallController(wall, { autoSlideMs, slidePlaysToEnd }))!;
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
  it('lets a video slide play to its end, then images use the interval', () => {
    // Photo 0 is a "video"; the others are images.
    let current: ReturnType<typeof useWallStore> | undefined;
    const { wall, controls } = open(() => 5000, id => current?.publishedColumns[id]!.photo === 0);
    current = wall;
    controls.touchColumn(1);
    controls.dispatch({ type: 'previous', columnId: 1 });
    controls.dispatch({ type: 'next', columnId: 1 });
    vi.advanceTimersByTime(20000);
    expect(wall.publishedColumns[1]!.photo).toBe(0);
    controls.mediaEnded(1);
    expect(wall.publishedColumns[1]!.photo).toBe(1);
    // An image: a late or stray ended event does nothing, the interval moves on.
    controls.mediaEnded(1);
    expect(wall.publishedColumns[1]!.photo).toBe(1);
    vi.advanceTimersByTime(5000);
    expect(wall.publishedColumns[1]!.photo).not.toBe(1);
  });

  it('ignores a video end while auto slide is off', () => {
    const { wall, controls } = open(() => 0, () => true);
    controls.mediaEnded(1);
    expect(wall.publishedColumns[1]!.photo).toBe(0);
  });
});

describe('page auto change', () => {
  function open(options: { autoPageMs: () => number; autoSlideMs?: () => number; slidePlaysToEnd?: (id: ColumnId) => boolean; pageMinMs?: (id: ColumnId) => number }) {
    const wall = useWallStore(createPinia());
    const scope = effectScope();
    scopes.push(scope);
    const controls = scope.run(() => useWallController(wall, { resetDelayMs: () => 120_000, ...options }))!;
    // Our Brand · RYU has two pages (PAGE 1 / PAGE 2).
    controls.dispatch({ type: 'subItem', columnId: 2, subItemId: 'ryu' });
    expect(wall.publishedColumns[2]!.pageCount).toBe(2);
    return { wall, controls };
  }

  it('shows the next page every interval and wraps', () => {
    const { wall } = open({ autoPageMs: () => 10_000 });
    vi.advanceTimersByTime(9999);
    expect(wall.publishedColumns[2]!.page).toBe(0);
    vi.advanceTimersByTime(1);
    expect(wall.publishedColumns[2]!.page).toBe(1);
    expect(wall.publishedColumns[2]!.photo).toBe(0);
    vi.advanceTimersByTime(10_000);
    expect(wall.publishedColumns[2]!.page).toBe(0);
  });

  it('waits for a playing video slide to end before changing page', () => {
    let video = true;
    const { wall, controls } = open({ autoPageMs: () => 10_000, slidePlaysToEnd: () => video });
    vi.advanceTimersByTime(15_000);
    expect(wall.publishedColumns[2]!.page).toBe(0);
    video = false;
    controls.touchColumn(2);
    video = true;
    controls.mediaEnded(2);
    expect(wall.publishedColumns[2]!.page).toBe(1);
  });

  it('keeps a page with rotating text parts until every part was shown', () => {
    const { wall } = open({ autoPageMs: () => 15_000, pageMinMs: () => 20_000 });
    vi.advanceTimersByTime(19_999);
    expect(wall.publishedColumns[2]!.page).toBe(0);
    vi.advanceTimersByTime(1);
    expect(wall.publishedColumns[2]!.page).toBe(1);
  });

  it('stays off while the interval is 0 (page tabs shown)', () => {
    const { wall } = open({ autoPageMs: () => 0 });
    vi.advanceTimersByTime(60_000);
    expect(wall.publishedColumns[2]!.page).toBe(0);
  });
});

describe('reset waits for the auto slideshow', () => {
  // Column 3 (Infrastruktur): photo 0 is a video, then 7 images; auto slide 5 s, reset 30 s.
  function open(autoSlideMs = () => 5000) {
    const wall = useWallStore(createPinia());
    const scope = effectScope();
    scopes.push(scope);
    let current: ReturnType<typeof useWallStore> | undefined;
    const controls = scope.run(() => useWallController(wall, {
      autoSlideMs,
      slidePlaysToEnd: id => current?.publishedColumns[id]!.photo === 0,
    }))!;
    current = wall;
    controls.dispatch({ type: 'main', columnId: 3 });
    // Re-evaluate the video flag now that the store is reachable.
    controls.dispatch({ type: 'next', columnId: 3 });
    controls.dispatch({ type: 'previous', columnId: 3 });
    expect(wall.publishedColumns[3]!.photoCount).toBe(8);
    return { wall, controls };
  }

  it('closes right after the last slide when the slideshow outlasts the reset time', () => {
    const { wall, controls } = open();
    vi.advanceTimersByTime(30_000);
    controls.mediaEnded(3); // the 30 s video ends
    expect(wall.getColumnState(3)).toBe('active');
    expect(wall.publishedColumns[3]!.photo).toBe(1);
    vi.advanceTimersByTime(6 * 5000);
    expect(wall.publishedColumns[3]!.photo).toBe(7);
    expect(wall.getColumnState(3)).toBe('active');
    vi.advanceTimersByTime(4999);
    expect(wall.getColumnState(3)).toBe('active');
    vi.advanceTimersByTime(1); // 30 s video + 7 × 5 s images = 65 s
    expect(wall.getColumnState(3)).toBe('idle');
  });

  it('keeps the normal reset time when the slideshow already finished', () => {
    const { wall, controls } = open(() => 3000);
    controls.mediaEnded(3); // short video
    vi.advanceTimersByTime(7 * 3000); // whole slideshow seen (21 s), wrapped back to the video
    expect(wall.publishedColumns[3]!.photo).toBe(0);
    vi.advanceTimersByTime(30_000 - 7 * 3000 - 1);
    expect(wall.getColumnState(3)).toBe('active');
    vi.advanceTimersByTime(1);
    expect(wall.getColumnState(3)).toBe('idle');
  });

  it('gives up after the safety cap and when auto slide is switched off', () => {
    const stuck = open();
    vi.advanceTimersByTime(30_000 + MAX_RESET_WAIT_MS - 1); // the video never ends
    expect(stuck.wall.getColumnState(3)).toBe('active');
    vi.advanceTimersByTime(1);
    expect(stuck.wall.getColumnState(3)).toBe('idle');

    const interval = ref(5000);
    const waiting = open(() => interval.value);
    vi.advanceTimersByTime(30_000);
    expect(waiting.wall.getColumnState(3)).toBe('active');
    interval.value = 0; // operator shows the arrows again
    expect(waiting.wall.getColumnState(3)).toBe('idle');
  });
});

describe('auto slide and auto page together', () => {
  // Our Brand · Rexco: page 1 has 4 photos, page 2 has 3.
  function open() {
    const wall = useWallStore(createPinia());
    const scope = effectScope();
    scopes.push(scope);
    scope.run(() => useWallController(wall, { autoSlideMs: () => 5000, autoPageMs: () => 10_000 }))!
      .dispatch({ type: 'subItem', columnId: 2, subItemId: 'rexco' });
    expect(wall.publishedColumns[2]).toMatchObject({ page: 0, photoCount: 4, pageCount: 2 });
    return wall;
  }

  it('changes page after the last photo instead of the page timer, then closes after the last page', () => {
    const wall = open();
    vi.advanceTimersByTime(15_000); // past the 10 s page interval: still page 1, photo 4
    expect(wall.publishedColumns[2]).toMatchObject({ page: 0, photo: 3 });
    vi.advanceTimersByTime(5000); // 4 photos × 5 s
    expect(wall.publishedColumns[2]).toMatchObject({ page: 1, photo: 0, photoCount: 3 });
    vi.advanceTimersByTime(10_000);
    expect(wall.publishedColumns[2]).toMatchObject({ page: 1, photo: 2 });
    expect(wall.getColumnState(2)).toBe('active'); // 30 s reset passed, last photo still showing
    vi.advanceTimersByTime(4999);
    expect(wall.getColumnState(2)).toBe('active');
    vi.advanceTimersByTime(1); // 20 s + 15 s = 35 s
    expect(wall.getColumnState(2)).toBe('idle');
  });
});
