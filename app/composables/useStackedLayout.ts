import { onScopeDispose, ref } from 'vue';

/**
 * Narrow or portrait screens (phones, tablets, small previews) stack the six columns into a
 * scrollable list instead of the 2304 × 1344 wall layout. The LED wall never matches this query.
 */
export const STACKED_LAYOUT_QUERY = '(max-width: 1023px), (max-aspect-ratio: 1/1)';

export function useStackedLayout(query = STACKED_LAYOUT_QUERY) {
  const media = typeof window === 'undefined' ? null : window.matchMedia(query);
  const stacked = ref(media?.matches ?? false);
  const update = (event: MediaQueryListEvent) => {
    stacked.value = event.matches;
  };
  media?.addEventListener('change', update);
  onScopeDispose(() => media?.removeEventListener('change', update));
  return stacked;
}
