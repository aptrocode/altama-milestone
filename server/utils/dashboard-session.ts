import type { H3Event } from 'h3';
import { createError, deleteCookie, getCookie, getRequestProtocol, setCookie } from 'h3';
import { DASHBOARD_COOKIE, DASHBOARD_SESSION_SECONDS, dashboardToken, dashboardUnlocked } from './dashboard-auth';

/** NUXT_DASHBOARD_PASSWORD (server only); empty = the dashboard is open. */
export function dashboardPassword(event: H3Event): string {
  return String(useRuntimeConfig(event).dashboardPassword || '');
}

/** True when this request may use the dashboard (no password, or a valid session cookie). */
export function hasDashboardSession(event: H3Event): boolean {
  return dashboardUnlocked(dashboardPassword(event), getCookie(event, DASHBOARD_COOKIE));
}

/** Starts (or restarts) the 3-day session cookie; nothing to do without a password. */
export function setDashboardSession(event: H3Event) {
  const password = dashboardPassword(event);
  if (!password)
    return;
  setCookie(event, DASHBOARD_COOKIE, dashboardToken(password), {
    httpOnly: true,
    sameSite: 'lax',
    secure: getRequestProtocol(event) === 'https',
    path: '/',
    maxAge: DASHBOARD_SESSION_SECONDS,
  });
}

/** Ends the session (logout). */
export function clearDashboardSession(event: H3Event) {
  deleteCookie(event, DASHBOARD_COOKIE, { path: '/' });
}

/** For dashboard-only API routes: 401 without a session; a valid one restarts its 3 days. */
export function requireDashboardSession(event: H3Event) {
  if (!hasDashboardSession(event))
    throw createError({ statusCode: 401, statusMessage: 'Login dashboard dulu' });
  setDashboardSession(event);
}
