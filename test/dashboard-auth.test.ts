import { describe, expect, it } from 'vitest';
import { DASHBOARD_SESSION_SECONDS, dashboardToken, dashboardUnlocked, sameSecret } from '../server/utils/dashboard-auth';

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 9, 22, 12);

describe('dashboard password', () => {
  it('stays open when no password is configured', () => {
    expect(dashboardUnlocked('', undefined)).toBe(true);
  });

  it('needs a session made with the configured password', () => {
    expect(dashboardUnlocked('s3cret-pass', undefined, NOW)).toBe(false);
    expect(dashboardUnlocked('s3cret-pass', 'guess', NOW)).toBe(false);
    expect(dashboardUnlocked('s3cret-pass', dashboardToken('other', NOW), NOW)).toBe(false);
    expect(dashboardUnlocked('s3cret-pass', dashboardToken('s3cret-pass', NOW), NOW)).toBe(true);
  });

  it('lasts 3 days from the last visit, and the expiry cannot be forged', () => {
    expect(DASHBOARD_SESSION_SECONDS).toBe(3 * 24 * 60 * 60);
    const token = dashboardToken('s3cret-pass', NOW);
    expect(dashboardUnlocked('s3cret-pass', token, NOW + 3 * DAY - 1000)).toBe(true);
    expect(dashboardUnlocked('s3cret-pass', token, NOW + 3 * DAY)).toBe(false);
    // A visit on day 2 issues a new token that runs 3 days from then.
    const renewed = dashboardToken('s3cret-pass', NOW + 2 * DAY);
    expect(dashboardUnlocked('s3cret-pass', renewed, NOW + 4 * DAY)).toBe(true);
    // Pushing the expiry forward breaks the signature.
    const [, signature] = token.split('.');
    expect(dashboardUnlocked('s3cret-pass', `${Math.floor(NOW / 1000) + 99 * 86400}.${signature}`, NOW)).toBe(false);
  });

  it('never stores the password itself in the cookie', () => {
    expect(dashboardToken('s3cret-pass', NOW)).not.toContain('s3cret-pass');
    expect(dashboardToken('s3cret-pass', NOW)).toMatch(/^\d+\.[0-9a-f]{64}$/);
  });

  it('compares secrets of any length safely', () => {
    expect(sameSecret('abc', 'abc')).toBe(true);
    expect(sameSecret('abc', 'abcd')).toBe(false);
    expect(sameSecret('', 'x')).toBe(false);
  });
});
