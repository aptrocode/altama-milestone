import type { ColumnId } from '../../shared/wall';
import { onScopeDispose, ref } from 'vue';
import { COLUMN_IDS } from '../../shared/wall';

/** One target showing the "you can press this" hint: a column's main card or one of its tiles. */
export interface TouchHint { columnId: ColumnId; key: string }

export interface TouchHintOptions {
  /** Hint targets of a column right now (empty while it is open): `main` or tile keys. */
  targets: (id: ColumnId) => string[];
  /** How long one target shows its hint (the shimmer and border trace). */
  showMs?: number;
  /** Pause before the next target. */
  gapMs?: number;
  /** A column stays quiet this long after any touch, so a visitor's own hold is never covered. */
  quietMs?: number;
}

/**
 * Idle attract hint: one pressable target at a time, column by column across the wall, plays a
 * shimmer plus a border trace that previews the hold. A touch on a column ends its hint at once and
 * keeps that column quiet for a while. Timers live with the owning scope.
 */
export function useTouchHints(options: TouchHintOptions) {
  const showMs = options.showMs ?? 1600;
  const gapMs = options.gapMs ?? 700;
  const quietMs = options.quietMs ?? 8000;
  const hint = ref<TouchHint | null>(null);
  const lastActivity = new Map<ColumnId, number>();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let last: TouchHint | null = null;

  function queue(): TouchHint[] {
    const now = Date.now();
    return COLUMN_IDS.flatMap(columnId => now - (lastActivity.get(columnId) ?? -Infinity) < quietMs
      ? []
      : options.targets(columnId).map(key => ({ columnId, key })));
  }

  function step() {
    const items = queue();
    if (!items.length) {
      hint.value = null;
      timer = setTimeout(step, gapMs);
      return;
    }
    // Continue after the previous target, even when columns opened or closed meanwhile.
    const index = last ? items.findIndex(item => item.columnId === last!.columnId && item.key === last!.key) : -1;
    const next = index >= 0
      ? items[(index + 1) % items.length]!
      : items.find(item => last && item.columnId > last.columnId) ?? items[0]!;
    last = next;
    hint.value = next;
    timer = setTimeout(() => {
      hint.value = null;
      timer = setTimeout(step, gapMs);
    }, showMs);
  }

  /** A touch on a column: stop its hint now and keep it quiet. */
  function activity(columnId: ColumnId) {
    lastActivity.set(columnId, Date.now());
    if (hint.value?.columnId === columnId)
      hint.value = null;
  }

  function stop() {
    clearTimeout(timer);
    timer = undefined;
    hint.value = null;
  }

  timer = setTimeout(step, gapMs);
  onScopeDispose(stop);
  return { hint, activity, stop };
}
