import type { ColumnId, WallAction } from '../../shared/wall';
import { onScopeDispose, watch } from 'vue';
import { useWallStore } from '~/stores/wall';
import { COLUMN_IDS } from '../../shared/wall';

export const AUTO_RESET_DELAY_MS = 30_000;
/** Longest a reset waits for an unfinished auto slideshow (a stalled video must not keep a card open). */
export const MAX_RESET_WAIT_MS = 5 * 60_000;

export interface WallControllerOptions {
  /** Inactivity before a column returns to idle/Indonesian; read when each timer starts (dashboard setting). */
  resetDelayMs?: () => number;
  /** Photo auto-slide interval for open cards, 0 when off (dashboard hides the slider arrows); reactive. */
  autoSlideMs?: () => number;
  /** Page auto-change interval for open cards, 0 when off (dashboard hides the page tabs); reactive. */
  autoPageMs?: () => number;
  /** Whether a column's visible slide is a video, which plays to its end (mediaEnded) instead of the interval. */
  slidePlaysToEnd?: (id: ColumnId) => boolean;
  /** Shortest time a column's visible page stays before an automatic page change (its rotating text parts); 0 when none. */
  pageMinMs?: (id: ColumnId) => number;
}

export function useWallController(wall = useWallStore(), options: WallControllerOptions = {}) {
  const timers = new Map<ColumnId, ReturnType<typeof setTimeout>>();
  const slideTimers = new Map<ColumnId, ReturnType<typeof setTimeout>>();
  const pageTimers = new Map<ColumnId, ReturnType<typeof setTimeout>>();
  // Columns whose page interval elapsed during a video slide; the page changes when it ends.
  const pagesDue = new Set<ColumnId>();
  // When each column's visible page appeared, so its rotating text parts can all be shown first.
  const pageShownAt = new Map<ColumnId, number>();
  // Auto slideshow vs. reset: a column whose slideshow has not reached its end since the last
  // interaction keeps its card open past the reset time (resetDue) until it does, or until the
  // safety cap (waitTimers) runs out.
  const cycleDone = new Set<ColumnId>();
  const resetDue = new Set<ColumnId>();
  const waitTimers = new Map<ColumnId, ReturnType<typeof setTimeout>>();
  let disposed = false;

  function clearTimer(id: ColumnId) {
    const timer = timers.get(id);
    if (timer !== undefined)
      clearTimeout(timer);
    timers.delete(id);
  }

  function clearWait(id: ColumnId) {
    const timer = waitTimers.get(id);
    if (timer !== undefined)
      clearTimeout(timer);
    waitTimers.delete(id);
    resetDue.delete(id);
  }

  function resetNow(id: ColumnId) {
    clearWait(id);
    clearTimer(id);
    wall.resetColumn(id);
  }

  function touchColumn(id: ColumnId) {
    if (disposed || !COLUMN_IDS.includes(id))
      return;
    clearTimer(id);
    clearWait(id);
    // Interaction starts a new viewing: the slideshow has to reach its end again.
    cycleDone.delete(id);
    if (wall.getColumnState(id) === 'idle' && wall.getColumnLocale(id) === 'id')
      return;
    timers.set(id, setTimeout(() => {
      timers.delete(id);
      // An auto slideshow that has not shown its last slide yet finishes first (e.g. a 30 s video
      // plus 5 × 5 s images resets at 55 s, not 30 s); a shorter one has already ended by now.
      if (autoAdvancing(id) && !cycleDone.has(id)) {
        resetDue.add(id);
        waitTimers.set(id, setTimeout(resetNow, MAX_RESET_WAIT_MS, id));
        return;
      }
      resetNow(id);
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
  // that column's countdown. It is not visitor activity; the inactivity reset only waits for the
  // slideshow to reach its end (completeCycle).
  function autoSliding(id: ColumnId) {
    const column = wall.publishedColumns[id];
    return !disposed && (options.autoSlideMs?.() ?? 0) > 0 && column?.phase === 'active' && (column.photoCount ?? 0) > 1;
  }

  function autoPaging(id: ColumnId) {
    const column = wall.publishedColumns[id];
    return !disposed && (options.autoPageMs?.() ?? 0) > 0 && column?.phase === 'active' && (column.pageCount ?? 0) > 1;
  }

  function autoAdvancing(id: ColumnId) {
    return autoSliding(id) || autoPaging(id);
  }

  /**
   * Both switches off and the page has several photos: the page changes after its last photo
   * instead of on the Auto page timer, so every photo of every page is shown (e.g. 10 + 5 photos at
   * 5 s: page 2 at 50 s, the slideshow ends at 75 s). Pages with one photo or none keep the timer.
   */
  function photosDrivePages(id: ColumnId) {
    return autoSliding(id) && autoPaging(id);
  }

  /** A video slide plays once (and reports its end) whenever something advances automatically. */
  function videoPlaysOnce(id: ColumnId) {
    return autoAdvancing(id) && !!options.slidePlaysToEnd?.(id);
  }

  /**
   * The slideshow is about to wrap (its last slide or last page has been shown): mark the viewing
   * complete, and close the card now instead of wrapping when the reset time already passed.
   * Returns true when the column was reset.
   */
  function completeCycle(id: ColumnId) {
    cycleDone.add(id);
    if (!resetDue.has(id))
      return false;
    resetNow(id);
    return true;
  }

  function nextSlide(id: ColumnId) {
    const column = wall.publishedColumns[id]!;
    const last = column.photo === (column.photoCount ?? 1) - 1;
    // The last photo of a page leads to the next page (the last page then ends the slideshow).
    if (last && photosDrivePages(id)) {
      autoNextPage(id);
      return;
    }
    if (last && completeCycle(id))
      return;
    wall.dispatch({ type: 'next', columnId: id });
  }

  /**
   * Automatic page change: a page whose text rotates in parts (pageMinMs) stays until every part has
   * been shown for its time, then changes (e.g. two 10 s parts keep the page 20 s even with a 15 s
   * Auto page). Manual tabs are not affected.
   */
  function autoNextPage(id: ColumnId) {
    clearPage(id);
    const wait = (options.pageMinMs?.(id) ?? 0) - (Date.now() - (pageShownAt.get(id) ?? 0));
    if (wait > 0) {
      pageTimers.set(id, setTimeout(() => {
        pageTimers.delete(id);
        autoNextPage(id);
      }, wait));
      return;
    }
    nextPage(id);
  }

  function nextPage(id: ColumnId) {
    const column = wall.publishedColumns[id]!;
    if (column.page === (column.pageCount ?? 1) - 1 && completeCycle(id))
      return;
    wall.dispatch({ type: 'page', columnId: id, page: (column.page + 1) % (column.pageCount ?? 1) });
  }

  // Auto page: the open card shows its next page (wrapping) after the interval, counted from the
  // last page change, unless its photos drive the pages (photosDrivePages). A video slide still
  // plays to its end first. Not visitor activity either.
  function schedulePage(id: ColumnId) {
    clearPage(id);
    if (!autoPaging(id) || photosDrivePages(id))
      return;
    pageTimers.set(id, setTimeout(() => {
      pageTimers.delete(id);
      if (videoPlaysOnce(id))
        pagesDue.add(id);
      else
        autoNextPage(id);
    }, options.autoPageMs?.() ?? 0));
  }

  function scheduleSlide(id: ColumnId) {
    clearSlide(id);
    if (!autoSliding(id) || options.slidePlaysToEnd?.(id))
      return;
    slideTimers.set(id, setTimeout(() => {
      slideTimers.delete(id);
      nextSlide(id);
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
      autoNextPage(id);
    else if (autoSliding(id))
      nextSlide(id);
  }

  // A string key, so a change in another column (publishedColumns is rebuilt) does not restart this one.
  for (const id of COLUMN_IDS) {
    watch(() => {
      const column = wall.publishedColumns[id];
      return [column?.phase, column?.subItem, column?.page, column?.locale].join('|');
    }, () => pageShownAt.set(id, Date.now()), { immediate: true, flush: 'sync' });
    watch(() => {
      const column = wall.publishedColumns[id];
      return [options.autoSlideMs?.() ?? 0, column?.phase, column?.subItem, column?.page, column?.photo, column?.photoCount, options.slidePlaysToEnd?.(id)].join('|');
    }, () => scheduleSlide(id), { immediate: true, flush: 'sync' });
    watch(() => {
      const column = wall.publishedColumns[id];
      return [options.autoPageMs?.() ?? 0, options.autoSlideMs?.() ?? 0, column?.phase, column?.subItem, column?.page, column?.pageCount, column?.photoCount].join('|');
    }, () => schedulePage(id), { immediate: true, flush: 'sync' });
    // The page count can shrink under an open card ("Scroll teks" merges pages): show its first page.
    watch(() => wall.publishedColumns[id]?.pageCount, () => wall.clampPage(id), { flush: 'sync' });
    // A card waiting for its slideshow closes at once when nothing advances any more (the operator
    // showed the arrows/tabs again, or the column changed).
    watch(() => autoAdvancing(id), (advancing) => {
      if (!advancing && resetDue.has(id))
        resetNow(id);
    }, { flush: 'sync' });
  }

  function dispose() {
    disposed = true;
    COLUMN_IDS.forEach(clearTimer);
    COLUMN_IDS.forEach(clearSlide);
    COLUMN_IDS.forEach(clearPage);
    COLUMN_IDS.forEach(clearWait);
  }

  COLUMN_IDS.forEach(touchColumn);
  onScopeDispose(dispose);
  return { dispatch, touchColumn, resetAll, mediaEnded, dispose };
}
