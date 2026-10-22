import { DASHBOARD_COOKIE, DASHBOARD_COOKIE_MAX_AGE, dashboardToken, sameSecret } from '../../utils/dashboard-auth';

/** Signs this browser in to /dashboard when the password matches NUXT_DASHBOARD_PASSWORD. */
export default defineEventHandler(async (event) => {
  const password = String(useRuntimeConfig(event).dashboardPassword || '');
  const body = await readBody<{ password?: unknown }>(event).catch(() => null);
  const given = typeof body?.password === 'string' ? body.password : '';

  if (password && !sameSecret(given, password)) {
    // A short pause makes guessing slow.
    await new Promise(resolve => setTimeout(resolve, 600));
    throw createError({ statusCode: 401, statusMessage: 'Password salah' });
  }

  if (password) {
    setCookie(event, DASHBOARD_COOKIE, dashboardToken(password), {
      httpOnly: true,
      sameSite: 'lax',
      secure: getRequestProtocol(event) === 'https',
      path: '/',
      maxAge: DASHBOARD_COOKIE_MAX_AGE,
    });
  }
  return { unlocked: true };
});
