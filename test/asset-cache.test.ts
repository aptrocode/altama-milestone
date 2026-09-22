import type { Milestone } from '../app/types/milestone';
import { describe, expect, it, vi } from 'vitest';
import { useAssetCache } from '../app/composables/useAssetCache';

function milestone(id = 'left-test'): Milestone {
  return {
    id,
    section: 'left',
    year: '2000',
    title: 'Test',
    description: 'Test',
    accent: '#fff',
    contentStatus: 'placeholder',
    artwork: {
      sketch: `/${id}/sketch.webp`,
      color: `/${id}/color.webp`,
      width: 640,
      height: 760,
    },
  };
}

describe('asset cache', () => {
  it('deduplicates concurrent requests for the same pair', async () => {
    const createImage = vi.fn(() => ({
      src: '',
      naturalWidth: 640,
      naturalHeight: 760,
      decode: vi.fn(async () => undefined),
    }));
    const cache = useAssetCache({ createImage, concurrency: 2 });
    const item = milestone();

    const [first, second] = await Promise.all([
      cache.preparePair(item),
      cache.preparePair(item),
    ]);

    expect(createImage).toHaveBeenCalledTimes(2);
    expect(first).toEqual(second);
    expect(cache.stats.ready).toBe(2);
  });

  it('rejects a pair whose decoded dimensions differ from the catalog', async () => {
    let call = 0;
    const cache = useAssetCache({
      createImage: () => {
        call++;
        return {
          src: '',
          naturalWidth: call === 1 ? 640 : 620,
          naturalHeight: 760,
          decode: async () => undefined,
        };
      },
    });

    await expect(cache.preparePair(milestone())).rejects.toThrow('sketch/color dimensions do not match');
  });
});
