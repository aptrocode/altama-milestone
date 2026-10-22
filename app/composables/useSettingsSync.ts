import { ref } from 'vue';

/**
 * Settings sync with the server's SQLite (`/api/settings`), driven by the settings-sync plugin:
 * - `synced`: this browser matches the server (and /dashboard saves go there);
 * - `saving`: a dashboard change is on its way;
 * - `follower`: following another server (NUXT_PUBLIC_SETTINGS_SYNC_URL); changes here stay local;
 * - `locked`: the server refused a save (dashboard login missing or expired);
 * - `offline`: no server database (e.g. Vercel, or no connection); settings stay in this browser;
 * - `checking`: before the first answer.
 */
export type SettingsSyncStatus = 'checking' | 'synced' | 'saving' | 'follower' | 'locked' | 'offline';

const status = ref<SettingsSyncStatus>('checking');
const host = ref('');
let refreshHandler: () => Promise<void> = async () => {};

export function useSettingsSync() {
  return {
    status,
    /** Host of the server being followed (follower mode). */
    host,
    /** Pull now (and seed an empty server from /dashboard), e.g. right after the dashboard login. */
    refresh: () => refreshHandler(),
  };
}

/** Used by the plugin only. */
export function registerSettingsSync(handler: () => Promise<void>) {
  refreshHandler = handler;
}
