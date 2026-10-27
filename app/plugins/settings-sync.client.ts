import { registerSettingsSync } from '~/composables/useSettingsSync';
import { useSettingsStore } from '~/stores/settings';

/** How often walls and dashboards check the server for changed settings. */
const POLL_MS = 5000;

interface SettingsDocument {
  version: number;
  settings: { hold: unknown; wall: unknown; fonts: unknown } | null;
}

/**
 * Keeps operator settings in sync with the server's SQLite (`/api/settings`), on top of the
 * browser copy from settings-storage (which runs first and stays the offline fallback):
 * every page pulls on start, every 5 s, and when it becomes visible, and applies a newer server
 * version; /dashboard pushes its changes (login needed). With NUXT_PUBLIC_SETTINGS_SYNC_URL on
 * another host (the event PC following the VPS) this browser only follows. A failed request is
 * retried by the next poll or save; meanwhile the browser copy keeps working.
 */
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const settings = useSettingsStore();
  const router = useRouter();

  const base = String(config.public.settingsSyncUrl || '').trim().replace(/\/+$/, '');
  const remote = !!base && new URL(base, window.location.href).origin !== window.location.origin;
  const endpoint = `${base}/api/settings`;

  let version = -1;
  let lastSynced = '';
  let applying = false;
  let pushTimer: ReturnType<typeof setTimeout> | undefined;

  const current = () => JSON.stringify({ hold: settings.hold, wall: settings.wall, fonts: settings.fonts });
  const canPush = () => !remote && router.currentRoute.value.path.startsWith('/dashboard');

  function apply(document: SettingsDocument) {
    if (!document.settings)
      return;
    applying = true;
    try {
      settings.applyExternal(document.settings);
    }
    finally {
      applying = false;
    }
    lastSynced = current();
  }

  async function push() {
    clearTimeout(pushTimer);
    const body = current();
    if (!canPush() || body === lastSynced)
      return;
    try {
      const saved = await $fetch<SettingsDocument>(endpoint, { method: 'PUT', body: JSON.parse(body) });
      version = saved.version;
      lastSynced = body;
    }
    catch {
      // Not signed in or server unreachable: the change stays in this browser until the next save.
    }
  }

  async function pull() {
    try {
      const document = await $fetch<SettingsDocument>(endpoint, { cache: 'no-store' });
      if (document.version === 0) {
        // Empty server: the first dashboard to open it seeds it with this browser's settings.
        version = 0;
        if (canPush())
          await push();
        return;
      }
      if (document.version !== version) {
        version = document.version;
        apply(document);
      }
    }
    catch {
      // No server database (e.g. Vercel) or no connection: keep the browser copy.
    }
  }

  // A dashboard change (save, import, reset) goes to the server; changes applied from the
  // server, or from another tab of this browser that match the server, do not echo back.
  settings.$subscribe(() => {
    if (applying || !canPush())
      return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(push, 300);
  }, { flush: 'sync' });

  registerSettingsSync(async () => {
    await pull();
    if (version > 0)
      await push();
  });

  pull();
  setInterval(pull, POLL_MS);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible')
      pull();
  });
});
