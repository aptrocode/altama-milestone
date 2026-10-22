import { clearDashboardSession } from '../../utils/dashboard-auth';

/** Signs this browser out of /dashboard. */
export default defineEventHandler((event) => {
  clearDashboardSession(event);
  return { unlocked: false };
});
