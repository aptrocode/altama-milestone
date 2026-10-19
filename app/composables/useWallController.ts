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
  /** Page auto-change interval for open cards, 0 when off (dashboard hides the page tabs); reactive. */
  autoPageMs?: () => number;
  /** Whether a column's visible slide is a video, which plays to its end (mediaEnded) instead of the interval. */
  slidePlaysToEnd?: (id: ColumnId) => boolean;
}

export function useWallController(wall = useWallStore(), options: WallControllerOptions = {}) {
  const timers = new Map<ColumnId, ReturnType<typeof setTimeout>>();
  const slideTimers = new Map<ColumnId, ReturnType<typeof setTimeout>>();
  const pageTimers = new Map<ColumnId, ReturnType<typeof setTimeout>>();
  // Columns whose page interval elapsed during a video slide; the page changes when it ends.
  const pagesDue = new Set<ColumnId>();
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

  function clearPage(id: ColumnId) {
    const timer = pageTimers.get(id);
    if (timer !== undefined)
      clearTimeout(timer);
    pageTimers.delete(id);
    pagesDue.delete(id);
  }

  // Auto slide: an open card with several photos moves to the next one after the interval, or, for
  // a video slide, when the video ends (mediaEnded). Any photo, page, or sub-item change restarts
  // that column's countdown. It is not visitor activity, so it never postpones the inactivity reset.
  function autoSliding(id: ColumnId) {
    const column = wall.publishedColumns[id];
    return !disposed && (options.autoSlideMs?.() ?? 0) > 0 && column?.phase === 'active' && (column.photoCount ?? 0) > 1;
  }

  function autoPaging(id: ColumnId) {
    const column = wall.publishedColumns[id];
    return !disposed && (options.autoPageMs?.() ?? 0) > 0 && column?.phase === 'active' && (column.pageCount ?? 0) > 1;
  }

  /** A video slide plays once (and reports its end) whenever something advances automatically. */
  function videoPlaysOnce(id: ColumnId) {
    return (autoSliding(id) || autoPaging(id)) && !!options.slidePlaysToEnd?.(id);
  }

  function nextPage(id: ColumnId) {
    const column = wall.publishedColumns[id]!;
    wall.dispatch({ type: 'page', columnId: id, page: (column.page + 1) % (column.pageCount ?? 1) });
  }

  // Auto page: the open card shows its next page (wrapping) after the interval, counted from the
  // last page change. A video slide still plays to its end first. Not visitor activity either.
  function schedulePage(id: ColumnId) {
    clearPage(id);
    if (!autoPaging(id))
      return;
    pageTimers.set(id, setTimeout(() => {
      pageTimers.delete(id);
      if (videoPlaysOnce(id))
        pagesDue.add(id);
      else
        nextPage(id);
    }, options.autoPageMs?.() ?? 0));
  }

  function scheduleSlide(id: ColumnId) {
    clearSlide(id);
    if (!autoSliding(id) || options.slidePlaysToEnd?.(id))
      return;
    slideTimers.set(id, setTimeout(() => {
      slideTimers.delete(id);
      wall.dispatch({ type: 'next', columnId: id });
    }, options.autoSlideMs?.() ?? 0));
  }

  /**
   * The visible video slide of a column finished (or failed): show the next page when its interval
   * already elapsed, otherwise the next slide while auto slide is on.
   */
  function mediaEnded(id: ColumnId) {
    if (!videoPlaysOnce(id))
      return;
    if (pagesDue.has(id))
      nextPage(id);
    else if (autoSliding(id))
      wall.dispatch({ type: 'next', columnId: id });
  }

  // A string key, so a change in another column (publishedColumns is rebuilt) does not restart this one.
  for (const id of COLUMN_IDS) {
    watch(() => {
      const column = wall.publishedColumns[id];
      return [options.autoSlideMs?.() ?? 0, column?.phase, column?.subItem, column?.page, column?.photo, column?.photoCount, options.slidePlaysToEnd?.(id)].join('|');
    }, () => scheduleSlide(id), { immediate: true, flush: 'sync' });
    watch(() => {
      const column = wall.publishedColumns[id];
      return [options.autoPageMs?.() ?? 0, column?.phase, column?.subItem, column?.page, column?.pageCount].join('|');
    }, () => schedulePage(id), { immediate: true, flush: 'sync' });
  }

  function dispose() {
    disposed = true;
    COLUMN_IDS.forEach(clearTimer);
    COLUMN_IDS.forEach(clearSlide);
    COLUMN_IDS.forEach(clearPage);
  }

  COLUMN_IDS.forEach(touchColumn);
  onScopeDispose(dispose);
  return { dispatch, touchColumn, resetAll, mediaEnded, dispose };
}
