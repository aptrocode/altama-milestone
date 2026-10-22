let refreshHandler: () => Promise<void> = async () => {};

/** Settings sync with the server's SQLite (`/api/settings`), driven by the settings-sync plugin. */
export function useSettingsSync() {
  return {
    /** Pull now (and seed an empty server from /dashboard), e.g. right after the dashboard login. */
    refresh: () => refreshHandler(),
  };
}

/** Used by the plugin only. */
export function registerSettingsSync(handler: () => Promise<void>) {
  refreshHandler = handler;
}
