import type { AssetCache, LoadedAssetPair } from '../app/composables/useAssetCache';
import type { AnimationResult } from '../app/composables/useMilestoneAnimation';
import type { Milestone, SectionState } from '../app/types/milestone';
import { describe, expect, it, vi } from 'vitest';
import { useMilestoneMachine } from '../app/composables/useMilestoneMachine';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

const pair = {} as LoadedAssetPair;

function item(id: string): Milestone {
  return {
    id,
    section: 'left',
    year: id,
    title: id,
    description: id,
    accent: '#fff',
    contentStatus: 'placeholder',
    artwork: { sketch: `/${id}/sketch.webp`, color: `/${id}/color.webp`, width: 640, height: 760 },
  };
}

async function eventually(assertion: () => void) {
  let lastError: unknown;
  for (let attempt = 0; attempt < 30; attempt++) {
    try {
      assertion();
      return;
    }
    catch (error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  throw lastError;
}

function harness(preparePair: AssetCache['preparePair']) {
  const catalog = [item('a'), item('b'), item('c')];
  const state: SectionState = {
    phase: 'IDLE',
    currentId: 'a',
    pendingId: null,
    assetStatus: 'loading',
    targetStatus: 'idle',
    error: null,
  };
  let staged: Milestone | null = null;
  const renderer = {
    reveal: vi.fn(async (): Promise<AnimationResult> => 'completed'),
    hide: vi.fn(async (): Promise<AnimationResult> => 'completed'),
    showIdle: vi.fn(),
    cancel: vi.fn(),
    stage: vi.fn(async (target: Milestone) => { staged = target; }),
    commit: vi.fn(async () => undefined),
    dispose: vi.fn(),
  };
  const cache: AssetCache = {
    stats: { ready: 0, loading: 0, estimatedBytes: 0 },
    preparePair,
    pinPair: vi.fn(),
    unpinPair: vi.fn(),
    retryPair: preparePair,
    dispose: vi.fn(),
  };
  const machine = useMilestoneMachine({
    section: 'left',
    initialId: 'a',
    getState: () => state,
    patch: patch => Object.assign(state, patch),
    getMilestone: id => catalog.find(entry => entry.id === id),
    getAdjacent: () => undefined,
    cache,
    renderer,
  });

  return { machine, state, renderer, cache, getStaged: () => staged };
}

describe('milestone machine', () => {
  it('reveals only after the current pair is ready', async () => {
    const ready = deferred<LoadedAssetPair>();
    const setup = harness(() => ready.promise);
    const starting = setup.machine.start();

    await setup.machine.reveal();
    expect(setup.renderer.reveal).not.toHaveBeenCalled();

    ready.resolve(pair);
    await starting;
    await setup.machine.reveal();
    expect(setup.state.phase).toBe('ACTIVE');
  });

  it('switches to the newest request without waiting for an obsolete decode', async () => {
    const b = deferred<LoadedAssetPair>();
    const c = deferred<LoadedAssetPair>();
    const setup = harness((target) => {
      if (target.id === 'b')
        return b.promise;
      if (target.id === 'c')
        return c.promise;
      return Promise.resolve(pair);
    });
    await setup.machine.start();

    setup.machine.selectMilestone('b');
    setup.machine.selectMilestone('c');
    c.resolve(pair);

    await eventually(() => expect(setup.state.currentId).toBe('c'));
    expect(setup.getStaged()?.id).toBe('c');
    expect(setup.renderer.stage).toHaveBeenCalledTimes(1);
    b.resolve(pair);
  });

  it('waits for an active reveal before hiding and switching', async () => {
    const reveal = deferred<AnimationResult>();
    const setup = harness(() => Promise.resolve(pair));
    setup.renderer.reveal.mockImplementation(() => reveal.promise);
    await setup.machine.start();

    const revealing = setup.machine.reveal();
    setup.machine.selectMilestone('b');
    await eventually(() => expect(setup.state.phase).toBe('REVEALING'));
    expect(setup.renderer.hide).not.toHaveBeenCalled();

    reveal.resolve('completed');
    await revealing;
    await eventually(() => expect(setup.state.currentId).toBe('b'));
    expect(setup.renderer.hide).toHaveBeenCalledTimes(1);
  });

  it('keeps the current milestone when the target fails', async () => {
    const setup = harness(target => target.id === 'b'
      ? Promise.reject(new Error('missing asset'))
      : Promise.resolve(pair));
    await setup.machine.start();

    setup.machine.selectMilestone('b');
    await eventually(() => expect(setup.state.targetStatus).toBe('error'));

    expect(setup.state.currentId).toBe('a');
    expect(setup.state.pendingId).toBeNull();
    expect(setup.renderer.commit).not.toHaveBeenCalled();
  });
});
