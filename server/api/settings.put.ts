import { DASHBOARD_COOKIE, dashboardUnlocked } from '../utils/dashboard-auth';
import { useSettingsDb } from '../utils/settings-db';

/** Saves operator settings from /dashboard; needs the dashboard login when a password is set. */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  if (!dashboardUnlocked(String(config.dashboardPassword || ''), getCookie(event, DASHBOARD_COOKIE)))
    throw createError({ statusCode: 401, statusMessage: 'Login dashboard dulu' });

  const body = await readBody(event).catch(() => null);
  if (!body || typeof body !== 'object')
    throw createError({ statusCode: 400, statusMessage: 'Settings missing' });

  setResponseHeader(event, 'Cache-Control', 'no-store');
  try {
    return (await useSettingsDb(String(config.settingsDb))).write(body);
  }
  catch (error) {
    console.error('[settings] database unavailable', error);
    throw createError({ statusCode: 503, statusMessage: 'Settings database unavailable' });
  }
});
