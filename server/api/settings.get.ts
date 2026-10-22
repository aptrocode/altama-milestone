import { useSettingsDb } from '../utils/settings-db';

/**
 * Current operator settings for every wall and dashboard. Public and cross-origin, so a wall on
 * another host (the event PC) can follow this server; 503 when the SQLite file cannot be used.
 */
export default defineEventHandler(async (event) => {
  setResponseHeaders(event, { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' });
  try {
    return (await useSettingsDb(String(useRuntimeConfig(event).settingsDb))).read();
  }
  catch (error) {
    console.error('[settings] database unavailable', error);
    throw createError({ statusCode: 503, statusMessage: 'Settings database unavailable' });
  }
});
