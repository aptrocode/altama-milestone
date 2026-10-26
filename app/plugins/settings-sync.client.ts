import type { SettingsDocument } from '../../shared/settings';
import { registerSettingsSync } from '~/composables/useSettingsSync';
import { useSettingsStore } from '~/stores/settings';
import { createSettingsSync } from '~/utils/settings-sync';

/** Every wall polls; only changes captured on the local dashboard may be saved. */
const POLL_MS = 5000;

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const settings = useSettingsStore();
  const router = useRouter();
  const base = String(config.public.settingsSyncUrl || '').trim().replace(/\/+$/, '');
  const remote = !!base && new URL(base, window.location.href).origin !== window.location.origin;
  const endpoint = `${base}/api/settings`;
  const current = () => ({ hold: settings.hold, wall: settings.wall, fonts: settings.fonts });
  const canSave = () => !remote && router.currentRoute.value.path.startsWith('/dashboard');
  let applying = false;

  const sync = createSettingsSync({
    read: current,
    apply(next) {
      applying = true;
      try {
        settings.setHold(next.hold);
        settings.setWall(next.wall);
        settings.setFonts(next.fonts);
      }
      finally {
        applying = false;
      }
    },
    fetch: () => $fetch<SettingsDocument>(endpoint, { cache: 'no-store' }),
    save: body => $fetch<SettingsDocument>(endpoint, { method: 'PUT', body }),
  });

  // Authorize and snapshot at the edit, so navigating away cannot cancel an already saved form.
  const unsubscribe = settings.$subscribe(() => {
    if (!applying && canSave())
      sync.queueSave(current());
  }, { flush: 'sync' });

  const refresh = () => sync.refresh(canSave() ? current() : undefined);
  const unregister = registerSettingsSync(refresh);
  const poll = setInterval(refresh, POLL_MS);
  function onVisibility() {
    if (document.visibilityState === 'visible')
      void refresh();
  }
  document.addEventListener('visibilitychange', onVisibility);

  function dispose() {
    clearInterval(poll);
    document.removeEventListener('visibilitychange', onVisibility);
    unsubscribe();
    unregister();
    sync.dispose();
  }
  nuxtApp.vueApp.onUnmount(dispose);
  import.meta.hot?.dispose(dispose);
  void refresh();
});
