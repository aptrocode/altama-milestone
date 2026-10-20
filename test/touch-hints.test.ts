import type { ColumnId } from '../shared/wall';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { effectScope } from 'vue';
import { useTouchHints } from '../app/composables/useTouchHints';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

function setup(targets: (id: ColumnId) => string[]) {
  const scope = effectScope();
  const hints = scope.run(() => useTouchHints({ targets, showMs: 1000, gapMs: 500, quietMs: 8000 }))!;
  return { hints, scope };
}

describe('touch hints', () => {
  it('shows one target at a time, column by column, with a gap between', () => {
    const { hints, scope } = setup(id => id === 2 ? ['tekiro', 'ryu'] : id === 3 ? ['main'] : []);
    const seen: (string | null)[] = [];
    for (let i = 0; i < 6; i++) {
      vi.advanceTimersByTime(500);
      seen.push(hints.hint.value && `${hints.hint.value.columnId}:${hints.hint.value.key}`);
      vi.advanceTimersByTime(1000);
      expect(hints.hint.value).toBeNull();
    }
    expect(seen).toEqual(['2:tekiro', '2:ryu', '3:main', '2:tekiro', '2:ryu', '3:main']);
    scope.stop();
  });

  it('stops a column\'s hint on touch and keeps it quiet, then resumes', () => {
    const { hints, scope } = setup(id => id === 1 ? ['main'] : []);
    vi.advanceTimersByTime(500);
    expect(hints.hint.value).toEqual({ columnId: 1, key: 'main' });
    hints.activity(1);
    expect(hints.hint.value).toBeNull();
    vi.advanceTimersByTime(7000);
    expect(hints.hint.value).toBeNull();
    vi.advanceTimersByTime(3000);
    expect(hints.hint.value).toEqual({ columnId: 1, key: 'main' });
    scope.stop();
    expect(hints.hint.value).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });
});
