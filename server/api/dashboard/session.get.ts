import { DASHBOARD_COOKIE, dashboardUnlocked, setDashboardSession } from '../../utils/dashboard-auth';

/**
 * Whether this browser may open /dashboard (no password configured, or a valid session). Opening
 * the dashboard restarts the 3-day session.
 */
export default defineEventHandler((event) => {
  const password = String(useRuntimeConfig(event).dashboardPassword || '');
  const unlocked = dashboardUnlocked(password, getCookie(event, DASHBOARD_COOKIE));
  if (unlocked && password)
    setDashboardSession(event, password);
  return { unlocked, required: !!password };
});
