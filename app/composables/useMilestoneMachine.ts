import type { AssetCache } from './useAssetCache';
import type { AnimationResult } from './useMilestoneAnimation';
import type { Milestone, SectionId, SectionState, SectionStatePatch } from '~/types/milestone';

export interface MilestoneRenderer {
  reveal: () => Promise<AnimationResult>;
  hide: () => Promise<AnimationResult>;
  showIdle: () => void;
  cancel: () => void;
  stage: (milestone: Milestone) => Promise<void>;
  commit: () => Promise<void>;
  dispose: () => void;
}

export interface MilestoneMachineOptions {
  section: SectionId;
  initialId: string;
  getState: () => SectionState;
  patch: (patch: SectionStatePatch) => void;
  getMilestone: (id: string) => Milestone | undefined;
  getAdjacent: (id: string) => Milestone | undefined;
  cache: AssetCache;
  renderer: MilestoneRenderer;
}

export interface MilestoneMachine {
  start: () => Promise<void>;
  reveal: () => Promise<void>;
  selectMilestone: (id: string) => void;
  reset: () => void;
  dispose: () => void;
}

export function useMilestoneMachine(options: MilestoneMachineOptions): MilestoneMachine {
  const { cache, renderer } = options;
  let lifecycleId = 0;
  let requestId = 0;
  let disposed = false;
  let coordinatorPromise: Promise<void> | null = null;
  let activeAnimation: Promise<AnimationResult> | null = null;
  let committingTargetId: string | null = null;
  let pinnedCurrentId: string | null = null;
  const requestWaiters = new Set<() => void>();

  function bumpRequest() {
    requestId++;
    for (const resolve of requestWaiters)
      resolve();
    requestWaiters.clear();
  }

  function requestChangeSignal(capturedRequest: number) {
    let resolveSignal!: () => void;
    const promise = new Promise<'changed'>((resolve) => {
      resolveSignal = () => resolve('changed');
      if (requestId !== capturedRequest)
        resolveSignal();
      else
        requestWaiters.add(resolveSignal);
    });

    return {
      promise,
      cancel: () => requestWaiters.delete(resolveSignal),
    };
  }

  function isAlive(lifecycle: number): boolean {
    return !disposed && lifecycle === lifecycleId;
  }

  function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown milestone error';
  }

  function prefetchAdjacent(id: string) {
    const adjacent = options.getAdjacent(id);
    if (adjacent)
      void cache.preparePair(adjacent, 'prefetch').catch(() => undefined);
  }

  async function start() {
    const lifecycle = lifecycleId;
    const current = options.getMilestone(options.getState().currentId);
    if (!current)
      throw new Error(`Missing initial milestone for ${options.section}`);

    options.patch({ assetStatus: 'loading', error: null });

    try {
      await cache.preparePair(current, 'interaction');
      if (!isAlive(lifecycle))
        return;

      cache.pinPair(current);
      pinnedCurrentId = current.id;
      renderer.showIdle();
      options.patch({ assetStatus: 'ready', phase: 'IDLE', error: null });
      prefetchAdjacent(current.id);
    }
    catch (error) {
      if (isAlive(lifecycle))
        options.patch({ assetStatus: 'error', error: errorMessage(error) });
    }
  }

  async function reveal() {
    const state = options.getState();
    if (state.phase !== 'IDLE' || state.assetStatus !== 'ready' || state.pendingId)
      return;

    const lifecycle = lifecycleId;
    options.patch({ phase: 'REVEALING', error: null });
    activeAnimation = renderer.reveal();
    const result = await activeAnimation;
    activeAnimation = null;

    if (!isAlive(lifecycle))
      return;

    if (result === 'completed' && options.getState().phase === 'REVEALING')
      options.patch({ phase: 'ACTIVE' });

    if (options.getState().pendingId)
      ensureCoordinator();
  }

  async function runCoordinator() {
    const lifecycle = lifecycleId;

    while (isAlive(lifecycle)) {
      const pendingId = options.getState().pendingId;
      if (!pendingId)
        break;

      const target = options.getMilestone(pendingId);
      const preparingRequest = requestId;
      if (!target) {
        options.patch({ pendingId: null, targetStatus: 'error', error: `Unknown milestone: ${pendingId}` });
        continue;
      }

      options.patch({ targetStatus: 'loading', error: null });

      const changeSignal = requestChangeSignal(preparingRequest);
      const preparation = await Promise.race([
        cache.preparePair(target, 'interaction').then(
          () => ({ kind: 'ready' as const }),
          (error: unknown) => ({ kind: 'error' as const, error }),
        ),
        changeSignal.promise.then(() => ({ kind: 'changed' as const })),
      ]);
      changeSignal.cancel();

      if (preparation.kind === 'changed')
        continue;

      if (preparation.kind === 'error') {
        const error = preparation.error;
        if (isAlive(lifecycle) && preparingRequest === requestId && options.getState().pendingId === target.id) {
          options.patch({
            pendingId: null,
            targetStatus: 'error',
            error: errorMessage(error),
          });
        }
        continue;
      }

      if (!isAlive(lifecycle))
        return;

      if (preparingRequest !== requestId || options.getState().pendingId !== target.id)
        continue;

      options.patch({ targetStatus: 'ready' });

      if (options.getState().phase === 'REVEALING' && activeAnimation)
        await activeAnimation;

      if (!isAlive(lifecycle))
        return;

      if (preparingRequest !== requestId || options.getState().pendingId !== target.id)
        continue;

      if (options.getState().phase === 'ACTIVE') {
        options.patch({ phase: 'HIDING' });
        activeAnimation = renderer.hide();
        const result = await activeAnimation;
        activeAnimation = null;
        if (!isAlive(lifecycle) || result === 'cancelled')
          return;
        options.patch({ phase: 'IDLE' });
      }

      if (preparingRequest !== requestId || options.getState().pendingId !== target.id) {
        if (!options.getState().pendingId) {
          renderer.showIdle();
          options.patch({ phase: 'IDLE', targetStatus: 'idle' });
        }
        continue;
      }

      await renderer.stage(target);
      if (!isAlive(lifecycle))
        return;

      if (preparingRequest !== requestId || options.getState().pendingId !== target.id)
        continue;

      const previous = options.getMilestone(options.getState().currentId);
      committingTargetId = target.id;
      cache.pinPair(target);
      await renderer.commit();
      committingTargetId = null;

      if (!isAlive(lifecycle)) {
        cache.unpinPair(target);
        return;
      }

      if (previous && previous.id === pinnedCurrentId)
        cache.unpinPair(previous);
      pinnedCurrentId = target.id;

      const latestPending = options.getState().pendingId;
      options.patch({
        currentId: target.id,
        phase: 'IDLE',
        assetStatus: 'ready',
        pendingId: latestPending === target.id ? null : latestPending,
        targetStatus: latestPending === target.id ? 'idle' : 'loading',
        error: null,
      });
      renderer.showIdle();
      prefetchAdjacent(target.id);
    }
  }

  function ensureCoordinator() {
    if (coordinatorPromise || disposed)
      return;

    coordinatorPromise = runCoordinator().finally(() => {
      coordinatorPromise = null;
      if (!disposed && options.getState().pendingId)
        ensureCoordinator();
    });
  }

  function selectMilestone(id: string) {
    const target = options.getMilestone(id);
    if (!target)
      return;

    const state = options.getState();

    if (id === state.currentId && !committingTargetId) {
      if (!state.pendingId)
        return;

      bumpRequest();
      options.patch({ pendingId: null, targetStatus: 'idle', error: null });
      if (state.phase === 'HIDING') {
        renderer.cancel();
        renderer.showIdle();
        options.patch({ phase: 'IDLE' });
      }
      return;
    }

    bumpRequest();
    options.patch({ pendingId: id, targetStatus: 'loading', error: null });
    void cache.preparePair(target, 'interaction').catch(() => undefined);
    ensureCoordinator();
  }

  function reset() {
    lifecycleId++;
    bumpRequest();
    renderer.cancel();
    renderer.showIdle();
    options.patch({ phase: 'IDLE', pendingId: null, targetStatus: 'idle', error: null });

    if (options.getState().currentId !== options.initialId) {
      selectMilestone(options.initialId);
    }
  }

  function dispose() {
    if (disposed)
      return;

    disposed = true;
    lifecycleId++;
    bumpRequest();
    renderer.dispose();
    const current = pinnedCurrentId ? options.getMilestone(pinnedCurrentId) : undefined;
    if (current)
      cache.unpinPair(current);
    pinnedCurrentId = null;
  }

  return { start, reveal, selectMilestone, reset, dispose };
}
