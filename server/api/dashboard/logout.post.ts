import { clearDashboardSession } from '../../utils/dashboard-session';

/** Signs this browser out of /dashboard. */
export default defineEventHandler((event) => {
  clearDashboardSession(event);
  return { unlocked: false };
});
