import { Buffer } from 'node:buffer';
import { createHmac, timingSafeEqual } from 'node:crypto';

/** Cookie that keeps a browser signed in to /dashboard. */
export const DASHBOARD_COOKIE = 'altama_dashboard';
/**
 * A session lasts 3 days and slides: every dashboard visit (session check) and every save starts
 * the 3 days again, so an operator who opens the dashboard at least every 3 days never logs in again.
 */
export const DASHBOARD_SESSION_SECONDS = 60 * 60 * 24 * 3;

/** HMAC of the expiry time, keyed by the password: changing NUXT_DASHBOARD_PASSWORD signs every browser out. */
function sign(password: string, expires: number): string {
  return createHmac('sha256', `altama-dashboard:${password}`).update(String(expires)).digest('hex');
}

/** Cookie value `expires.signature`: the expiry is checked on the server, never the password itself. */
export function dashboardToken(password: string, now = Date.now()): string {
  const expires = Math.floor(now / 1000) + DASHBOARD_SESSION_SECONDS;
  return `${expires}.${sign(password, expires)}`;
}

/** Constant-time string comparison. */
export function sameSecret(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

/** True when no password is configured (dashboard open), or the cookie is a valid, unexpired session. */
export function dashboardUnlocked(password: string, cookie: string | undefined, now = Date.now()): boolean {
  if (!password)
    return true;
  const [rawExpires, signature] = (cookie ?? '').split('.');
  const expires = Number(rawExpires);
  if (!signature || !Number.isInteger(expires) || expires * 1000 <= now)
    return false;
  return sameSecret(signature, sign(password, expires));
}
