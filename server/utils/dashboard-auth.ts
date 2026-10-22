import { Buffer } from 'node:buffer';
import { createHash, timingSafeEqual } from 'node:crypto';

/** Cookie that keeps a browser signed in to /dashboard. */
export const DASHBOARD_COOKIE = 'altama_dashboard';
/** A signed-in browser stays signed in for 30 days. */
export const DASHBOARD_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

/**
 * Cookie value for a password: a hash, so the cookie never holds the password itself and
 * changing NUXT_DASHBOARD_PASSWORD signs every browser out.
 */
export function dashboardToken(password: string): string {
  return createHash('sha256').update(`altama-dashboard:${password}`).digest('hex');
}

/** Constant-time string comparison. */
export function sameSecret(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

/** True when no password is configured (dashboard open) or the cookie matches it. */
export function dashboardUnlocked(password: string, cookie: string | undefined): boolean {
  if (!password)
    return true;
  return !!cookie && sameSecret(cookie, dashboardToken(password));
}
