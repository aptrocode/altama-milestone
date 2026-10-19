import type { ColumnId, WallAction } from '../../shared/wall';
import { onScopeDispose, watch } from 'vue';
import { useWallStore } from '~/stores/wall';
import { COLUMN_IDS } from '../../shared/wall';

export const AUTO_RESET_DELAY_MS = 30_000;

export interface WallControllerOptions {
  /** Inactivity before a column returns to idle/Indonesian; read when each timer starts (dashboard setting). */
  resetDelayMs?: () => number;
  /** Photo auto-slide interval for open cards, 0 when off (dashboard hides the slider arrows); reactive. */
  autoSlideMs?: () => number;
}

export function useWallController(wall = useWallStore(), options: WallControllerOptions = {}) {
  const timers = new Map<ColumnId, ReturnType<typeof setTimeout>>();
  const slideTimers = new Map<ColumnId, ReturnType<typeof setTimeout>>();
  let disposed = false;

  function clearTimer(id: ColumnId) {
    const timer = timers.get(id);
    if (timer !== undefined)
      clearTimeout(timer);
    timers.delete(id);
  }

  function touchColumn(id: ColumnId) {
    if (disposed || !COLUMN_IDS.includes(id))
      return;
    clearTimer(id);
    if (wall.getColumnState(id) === 'idle' && wall.getColumnLocale(id) === 'id')
      return;
    timers.set(id, setTimeout(() => {
      timers.delete(id);
      wall.resetColumn(id);
    }, options.resetDelayMs?.() ?? AUTO_RESET_DELAY_MS));
  }

  function dispatch(action: WallAction) {
    if (disposed || !wall.dispatch(action))
      return false;
    touchColumn(action.columnId);
    return true;
  }

  function resetAll() {
    if (disposed)
      return;
    wall.resetAll();
    COLUMN_IDS.forEach(touchColumn);
  }

  function clearSlide(id: ColumnId) {
    const timer = slideTimers.get(id);
    if (timer !== undefined)
      clearTimeout(timer);
    slideTimers.delete(id);
  }

  // Auto slide: an open card with several photos moves to the next one after the interval. Any
  // photo, page, or sub-item change restarts that column's countdown. It is not visitor activity,
  // so it never postpones the inactivity reset.
  function scheduleSlide(id: ColumnId) {
    clearSlide(id);
    const ms = options.autoSlideMs?.() ?? 0;
    const column = wall.publishedColumns[id];
    if (disposed || ms <= 0 || column?.phase !== 'active' || (column.photoCount ?? 0) < 2)
      return;
    slideTimers.set(id, setTimeout(() => {
      slideTimers.delete(id);
      wall.dispatch({ type: 'next', columnId: id });
    }, ms));
  }

  // A string key, so a change in another column (publishedColumns is rebuilt) does not restart this one.
  for (const id of COLUMN_IDS) {
    watch(() => {
      const column = wall.publishedColumns[id];
      return [options.autoSlideMs?.() ?? 0, column?.phase, column?.subItem, column?.page, column?.photo, column?.photoCount].join('|');
    }, () => scheduleSlide(id), { immediate: true, flush: 'sync' });
  }

  function dispose() {
    disposed = true;
    COLUMN_IDS.forEach(clearTimer);
    COLUMN_IDS.forEach(clearSlide);
  }

  COLUMN_IDS.forEach(touchColumn);
  onScopeDispose(dispose);
  return { dispatch, touchColumn, resetAll, dispose };
}
