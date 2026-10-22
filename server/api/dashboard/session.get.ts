import { DASHBOARD_COOKIE, dashboardUnlocked } from '../../utils/dashboard-auth';

/** Whether this browser may open /dashboard (no password configured, or signed in). */
export default defineEventHandler((event) => {
  const password = String(useRuntimeConfig(event).dashboardPassword || '');
  return { unlocked: dashboardUnlocked(password, getCookie(event, DASHBOARD_COOKIE)) };
});
