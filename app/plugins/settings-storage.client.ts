import { SETTINGS_STORAGE_KEY, useSettingsStore } from '~/stores/settings';

function read(): unknown {
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }
  catch {
    return null;
  }
}

/**
 * Loads operator settings from this browser, saves every change, and applies changes made in
 * another tab (e.g. /dashboard next to the running wall) without a reload.
 */
export default defineNuxtPlugin(() => {
  const settings = useSettingsStore();
  const stored = read() as { hold?: unknown; wall?: unknown; fonts?: unknown } | null;
  if (stored?.hold)
    settings.setHold(stored.hold);
  if (stored?.wall)
    settings.setWall(stored.wall);
  if (stored?.fonts)
    settings.setFonts(stored.fonts);

  settings.$subscribe((_mutation, state) => {
    try {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ hold: state.hold, wall: state.wall, fonts: state.fonts }));
    }
    catch {
      // Private mode or full storage: settings still apply for this session.
    }
  });

  window.addEventListener('storage', (event) => {
    if (event.key !== SETTINGS_STORAGE_KEY)
      return;
    settings.applyExternal(read() as { hold?: unknown; wall?: unknown; fonts?: unknown } | null);
  });
});
