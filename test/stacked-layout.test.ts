import { afterEach, describe, expect, it, vi } from 'vitest';
import { effectScope } from 'vue';
import { STACKED_LAYOUT_QUERY, useStackedLayout } from '../app/composables/useStackedLayout';

function stubMatchMedia(matches: boolean) {
  const listeners = new Set<(event: { matches: boolean }) => void>();
  const media = {
    matches,
    addEventListener: vi.fn((_: string, listener: (event: { matches: boolean }) => void) => listeners.add(listener)),
    removeEventListener: vi.fn((_: string, listener: (event: { matches: boolean }) => void) => listeners.delete(listener)),
  };
  vi.stubGlobal('window', { matchMedia: vi.fn(() => media) });
  return { media, emit: (value: boolean) => listeners.forEach(listener => listener({ matches: value })) };
}

afterEach(() => vi.unstubAllGlobals());

describe('stacked layout query', () => {
  it('follows the narrow/portrait media query and releases its listener with the scope', () => {
    const { media, emit } = stubMatchMedia(true);
    const scope = effectScope();
    const stacked = scope.run(() => useStackedLayout())!;
    expect(window.matchMedia).toHaveBeenCalledWith(STACKED_LAYOUT_QUERY);
    expect(stacked.value).toBe(true);
    emit(false);
    expect(stacked.value).toBe(false);
    scope.stop();
    expect(media.removeEventListener).toHaveBeenCalledTimes(1);
  });
});
