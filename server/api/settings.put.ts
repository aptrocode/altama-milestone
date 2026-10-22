import { requireDashboardSession } from '../utils/dashboard-session';
import { useSettingsDb } from '../utils/settings-db';

/**
 * Saves operator settings from /dashboard; needs the dashboard login when a password is set
 * (saving also restarts the 3-day session).
 */
export default defineEventHandler(async (event) => {
  requireDashboardSession(event);

  const body = await readBody(event).catch(() => null);
  if (!body || typeof body !== 'object')
    throw createError({ statusCode: 400, statusMessage: 'Settings missing' });

  setResponseHeader(event, 'Cache-Control', 'no-store');
  try {
    return (await useSettingsDb(useRuntimeConfig(event).settingsDb)).write(body);
  }
  catch (error) {
    console.error('[settings] database unavailable', error);
    throw createError({ statusCode: 503, statusMessage: 'Settings database unavailable' });
  }
});
