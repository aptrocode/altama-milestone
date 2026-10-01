import type { ColumnId, WallAction } from '../../shared/wall';
import { onScopeDispose } from 'vue';
import { useWallStore } from '~/stores/wall';
import { COLUMN_IDS } from '../../shared/wall';

export const AUTO_RESET_DELAY_MS = 15_000;

export function useWallController(wall = useWallStore()) {
  const timers = new Map<ColumnId, ReturnType<typeof setTimeout>>();
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
    }, AUTO_RESET_DELAY_MS));
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

  function dispose() {
    disposed = true;
    COLUMN_IDS.forEach(clearTimer);
  }

  COLUMN_IDS.forEach(touchColumn);
  onScopeDispose(dispose);
  return { dispatch, touchColumn, resetAll, dispose };
}
