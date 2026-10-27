import type { SettingsDocument, SyncedSettings } from '../../shared/settings';

export interface SettingsSyncOptions {
  read: () => SyncedSettings;
  apply: (settings: SyncedSettings) => void;
  fetch: () => Promise<SettingsDocument>;
  save: (settings: SyncedSettings) => Promise<SettingsDocument>;
}

/**
 * One ordered request queue. Only the plugin may authorize/capture saves; once captured, a save
 * survives navigation. Polling retries pending writes before reading the server. This controller
 * owns its debounce timer and ignores responses after disposal; it contains no Vue/Nuxt resources.
 */
export function createSettingsSync(options: SettingsSyncOptions) {
  let version = -1;
  let lastSynced = '';
  let pending: string | undefined;
  let seed: string | undefined;
  let pullRequested = false;
  let revision = 0;
  let disposed = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let requests = Promise.resolve();

  async function drain() {
    while (pending !== undefined || pullRequested) {
      if (disposed)
        return;
      if (pending !== undefined) {
        const body = pending;
        pending = undefined;
        if (body === lastSynced)
          continue;
        try {
          const saved = await options.save(JSON.parse(body) as SyncedSettings);
          if (disposed)
            return;
          version = Math.max(version, saved.version);
          lastSynced = body;
        }
        catch {
          // Keep the newest captured save offline; do not pull older server data over it.
          pending ??= body;
          pullRequested = false;
          return;
        }
        continue;
      }

      pullRequested = false;
      const editRevision = revision;
      const emptySeed = seed;
      seed = undefined;
      try {
        const document = await options.fetch();
        if (disposed || editRevision !== revision)
          continue;
        if (document.version === 0 && version < 1) {
          // Only an authorized dashboard refresh supplies an empty-server seed.
          pending = emptySeed;
          continue;
        }
        if (document.version <= version || !document.settings)
          continue;
        version = document.version;
        options.apply(document.settings);
        lastSynced = JSON.stringify(options.read());
      }
      catch {
        // Offline (or a static preview without the API): keep the local browser copy.
      }
    }
  }

  function run() {
    // Serialize all GET/PUT operations, including refreshes started during a save.
    const next = requests.then(drain);
    requests = next.catch(() => {});
    return next;
  }

  function queueSave(settings: SyncedSettings) {
    if (disposed)
      return;
    revision++;
    pending = JSON.stringify(settings);
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      void run();
    }, 300);
  }

  function refresh(emptySeed?: SyncedSettings) {
    if (disposed)
      return Promise.resolve();
    clearTimeout(timer);
    timer = undefined;
    pullRequested = true;
    seed = emptySeed ? JSON.stringify(emptySeed) : undefined;
    return run();
  }

  function dispose() {
    disposed = true;
    clearTimeout(timer);
    pending = undefined;
    seed = undefined;
    pullRequested = false;
  }

  return { queueSave, refresh, dispose };
}
