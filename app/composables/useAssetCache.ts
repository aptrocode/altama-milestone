import type { Milestone } from '~/types/milestone';
import { reactive } from 'vue';

export type AssetPriority = 'interaction' | 'prefetch';

interface ImageLike {
  src: string;
  naturalWidth: number;
  naturalHeight: number;
  decode: () => Promise<void>;
}

export interface LoadedAsset {
  url: string;
  width: number;
  height: number;
  estimatedBytes: number;
}

export interface LoadedAssetPair {
  sketch: LoadedAsset;
  color: LoadedAsset;
}

interface CacheEntry {
  status: 'loading' | 'ready';
  promise: Promise<LoadedAsset>;
  image: ImageLike | null;
  asset: LoadedAsset | null;
  pins: number;
  lastUsed: number;
}

interface QueueTask {
  priority: AssetPriority;
  run: () => Promise<void>;
}

export interface AssetCacheOptions {
  maxDecodedBytes?: number;
  concurrency?: number;
  timeoutMs?: number;
  createImage?: () => ImageLike;
  now?: () => number;
}

export interface AssetCache {
  stats: {
    ready: number;
    loading: number;
    estimatedBytes: number;
  };
  preparePair: (milestone: Milestone, priority?: AssetPriority) => Promise<LoadedAssetPair>;
  pinPair: (milestone: Milestone) => void;
  unpinPair: (milestone: Milestone) => void;
  retryPair: (milestone: Milestone, priority?: AssetPriority) => Promise<LoadedAssetPair>;
  dispose: () => void;
}

const DEFAULT_MAX_DECODED_BYTES = 128 * 1024 * 1024;

function defaultImageFactory(): ImageLike {
  return new Image();
}

export function useAssetCache(options: AssetCacheOptions = {}): AssetCache {
  const maxDecodedBytes = options.maxDecodedBytes ?? DEFAULT_MAX_DECODED_BYTES;
  const concurrency = Math.max(1, options.concurrency ?? 2);
  const timeoutMs = options.timeoutMs ?? 10_000;
  const createImage = options.createImage ?? defaultImageFactory;
  const now = options.now ?? Date.now;
  const entries = new Map<string, CacheEntry>();
  const interactionQueue: QueueTask[] = [];
  const prefetchQueue: QueueTask[] = [];
  let activeTasks = 0;
  let disposed = false;

  const stats = reactive({
    ready: 0,
    loading: 0,
    estimatedBytes: 0,
  });

  function updateStats() {
    let ready = 0;
    let loading = 0;
    let estimatedBytes = 0;

    for (const entry of entries.values()) {
      if (entry.status === 'ready') {
        ready++;
        estimatedBytes += entry.asset?.estimatedBytes ?? 0;
      }
      else {
        loading++;
      }
    }

    Object.assign(stats, { ready, loading, estimatedBytes });
  }

  function evictIfNeeded() {
    let total = [...entries.values()].reduce(
      (sum, entry) => sum + (entry.asset?.estimatedBytes ?? 0),
      0,
    );

    if (total <= maxDecodedBytes)
      return;

    const candidates = [...entries.entries()]
      .filter(([, entry]) => entry.status === 'ready' && entry.pins === 0)
      .sort(([, left], [, right]) => left.lastUsed - right.lastUsed);

    for (const [url, entry] of candidates) {
      entries.delete(url);
      total -= entry.asset?.estimatedBytes ?? 0;
      if (total <= maxDecodedBytes)
        break;
    }

    updateStats();
  }

  function drainQueue() {
    if (disposed)
      return;

    while (activeTasks < concurrency) {
      const task = interactionQueue.shift() ?? prefetchQueue.shift();
      if (!task)
        break;

      activeTasks++;
      void task.run().finally(() => {
        activeTasks--;
        drainQueue();
      });
    }
  }

  function enqueue(task: QueueTask) {
    (task.priority === 'interaction' ? interactionQueue : prefetchQueue).push(task);
    drainQueue();
  }

  function decodeWithTimeout(image: ImageLike, url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`asset timed out: ${url}`)), timeoutMs);

      image.decode().then(
        () => {
          clearTimeout(timer);
          resolve();
        },
        (error: unknown) => {
          clearTimeout(timer);
          reject(error instanceof Error ? error : new Error(`asset decode failed: ${url}`));
        },
      );
    });
  }

  function load(url: string, priority: AssetPriority): Promise<LoadedAsset> {
    if (disposed)
      return Promise.reject(new Error('asset cache is disposed'));

    const existing = entries.get(url);
    if (existing) {
      existing.lastUsed = now();
      return existing.promise;
    }

    let resolveAsset!: (asset: LoadedAsset) => void;
    let rejectAsset!: (error: unknown) => void;
    const promise = new Promise<LoadedAsset>((resolve, reject) => {
      resolveAsset = resolve;
      rejectAsset = reject;
    });

    const entry: CacheEntry = {
      status: 'loading',
      promise,
      image: null,
      asset: null,
      pins: 0,
      lastUsed: now(),
    };
    entries.set(url, entry);
    updateStats();

    enqueue({
      priority,
      run: async () => {
        if (disposed) {
          entries.delete(url);
          rejectAsset(new Error('asset cache is disposed'));
          updateStats();
          return;
        }

        try {
          const image = createImage();
          image.src = url;
          await decodeWithTimeout(image, url);

          if (image.naturalWidth <= 0 || image.naturalHeight <= 0)
            throw new Error(`asset has invalid dimensions: ${url}`);

          const asset: LoadedAsset = {
            url,
            width: image.naturalWidth,
            height: image.naturalHeight,
            estimatedBytes: image.naturalWidth * image.naturalHeight * 4,
          };

          entry.status = 'ready';
          entry.image = image;
          entry.asset = asset;
          entry.lastUsed = now();
          resolveAsset(asset);
          updateStats();
          evictIfNeeded();
        }
        catch (error) {
          entries.delete(url);
          rejectAsset(error instanceof Error ? error : new Error(`asset failed: ${url}`));
          updateStats();
        }
      },
    });

    return promise;
  }

  async function preparePair(milestone: Milestone, priority: AssetPriority = 'interaction'): Promise<LoadedAssetPair> {
    const [sketch, color] = await Promise.all([
      load(milestone.artwork.sketch, priority),
      load(milestone.artwork.color, priority),
    ]);

    const expected = milestone.artwork;
    if (sketch.width !== color.width || sketch.height !== color.height)
      throw new Error(`sketch/color dimensions do not match for ${milestone.id}`);

    if (sketch.width !== expected.width || sketch.height !== expected.height)
      throw new Error(`asset dimensions do not match catalog for ${milestone.id}`);

    return { sketch, color };
  }

  function changePins(milestone: Milestone, delta: number) {
    for (const url of [milestone.artwork.sketch, milestone.artwork.color]) {
      const entry = entries.get(url);
      if (entry)
        entry.pins = Math.max(0, entry.pins + delta);
    }
    evictIfNeeded();
  }

  function retryPair(milestone: Milestone, priority: AssetPriority = 'interaction') {
    for (const url of [milestone.artwork.sketch, milestone.artwork.color]) {
      const entry = entries.get(url);
      if (entry?.status === 'ready' && entry.pins === 0)
        entries.delete(url);
    }
    updateStats();
    return preparePair(milestone, priority);
  }

  function dispose() {
    disposed = true;
    interactionQueue.splice(0);
    prefetchQueue.splice(0);
    entries.clear();
    updateStats();
  }

  return {
    stats,
    preparePair,
    pinPair: milestone => changePins(milestone, 1),
    unpinPair: milestone => changePins(milestone, -1),
    retryPair,
    dispose,
  };
}
