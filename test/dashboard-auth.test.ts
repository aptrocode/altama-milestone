import { describe, expect, it } from 'vitest';
import { dashboardToken, dashboardUnlocked, sameSecret } from '../server/utils/dashboard-auth';

describe('dashboard password', () => {
  it('stays open when no password is configured', () => {
    expect(dashboardUnlocked('', undefined)).toBe(true);
  });

  it('needs the cookie for the configured password', () => {
    expect(dashboardUnlocked('s3cret-pass', undefined)).toBe(false);
    expect(dashboardUnlocked('s3cret-pass', 'guess')).toBe(false);
    expect(dashboardUnlocked('s3cret-pass', dashboardToken('other'))).toBe(false);
    expect(dashboardUnlocked('s3cret-pass', dashboardToken('s3cret-pass'))).toBe(true);
  });

  it('never stores the password itself in the cookie', () => {
    expect(dashboardToken('s3cret-pass')).not.toContain('s3cret-pass');
    expect(dashboardToken('s3cret-pass')).toMatch(/^[0-9a-f]{64}$/);
  });

  it('compares secrets of any length safely', () => {
    expect(sameSecret('abc', 'abc')).toBe(true);
    expect(sameSecret('abc', 'abcd')).toBe(false);
    expect(sameSecret('', 'x')).toBe(false);
  });
});
