import { useSettingsStore } from '~/stores/settings';
import { normalizeFontSettings } from '../../shared/font-settings';
import { normalizeHoldSettings } from '../../shared/hold-settings';
import { normalizeWallSettings } from '../../shared/wall-settings';

/**
 * Export/import of every operator setting stored in this browser (hold rules, wall, and fonts)
 * as `altama-settings.json`. Older `altama-hold-settings.json` files carry only `hold`.
 */
export function useSettingsBackup() {
  const settings = useSettingsStore();

  function exportSettings() {
    const blob = new Blob([`${JSON.stringify({ hold: settings.hold, wall: settings.wall, fonts: settings.fonts }, null, 2)}\n`], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'altama-settings.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  /** Applies a backup file immediately; resolves to false when the file has no settings. */
  async function importSettings(file: File): Promise<boolean> {
    try {
      const data = JSON.parse(await file.text()) as { hold?: unknown; wall?: unknown; fonts?: unknown };
      if (!data || typeof data !== 'object' || (!data.hold && !data.wall && !data.fonts))
        return false;
      if (data.hold)
        settings.setHold(normalizeHoldSettings(data.hold));
      if (data.wall)
        settings.setWall(normalizeWallSettings(data.wall));
      if (data.fonts)
        settings.setFonts(normalizeFontSettings(data.fonts));
      return true;
    }
    catch {
      return false;
    }
  }

  return { exportSettings, importSettings };
}
