import { dashboardPassword, hasDashboardSession, setDashboardSession } from '../../utils/dashboard-session';

/**
 * Whether this browser may open /dashboard (no password configured, or a valid session), and
 * whether a password is set (the Keluar button). Opening the dashboard restarts the 3-day session.
 */
export default defineEventHandler((event) => {
  const unlocked = hasDashboardSession(event);
  if (unlocked)
    setDashboardSession(event);
  return { unlocked, required: !!dashboardPassword(event) };
});
