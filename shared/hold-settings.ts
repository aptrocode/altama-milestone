import type { WallAction } from './wall';

/**
 * Operator-configurable hold (dwell) rules, edited on /dashboard and published to Sensor Service.
 * - card: idle main card and sub-item tiles (columns 2/5)
 * - page: page tabs (1960/1996, PAGE 1/PAGE 2)
 * - slider: photo arrows
 * - language: language flags (off by default: a normal press)
 * - back: the open card's close (✕) button (off by default)
 */
export const HOLD_GROUPS = ['card', 'page', 'slider', 'language', 'back'] as const;
export type HoldGroup = typeof HOLD_GROUPS[number];

export interface HoldRule {
  /** false: the button activates on a normal press. */
  enabled: boolean;
  /** Dwell time when enabled. */
  seconds: number;
}

export type HoldSettings = Record<HoldGroup, HoldRule>;

export const HOLD_SECONDS = { min: 0.3, max: 5, step: 0.1 } as const;

export const DEFAULT_HOLD_SETTINGS: HoldSettings = {
  card: { enabled: true, seconds: 1 },
  page: { enabled: true, seconds: 1 },
  slider: { enabled: true, seconds: 1 },
  language: { enabled: false, seconds: 1 },
  back: { enabled: false, seconds: 1 },
};

/** Which hold rule applies to each wall action. */
export const HOLD_GROUP_BY_ACTION: Partial<Record<WallAction['type'], HoldGroup>> = {
  main: 'card',
  subItem: 'card',
  page: 'page',
  previous: 'slider',
  next: 'slider',
  language: 'language',
  back: 'back',
};

function normalizeRule(value: unknown, fallback: HoldRule): HoldRule {
  const rule = (typeof value === 'object' && value !== null ? value : {}) as Partial<HoldRule>;
  const raw = typeof rule.seconds === 'number' && Number.isFinite(rule.seconds) ? rule.seconds : fallback.seconds;
  const clamped = Math.min(HOLD_SECONDS.max, Math.max(HOLD_SECONDS.min, raw));
  return {
    enabled: typeof rule.enabled === 'boolean' ? rule.enabled : fallback.enabled,
    seconds: Math.round(clamped * 10) / 10,
  };
}

/** Accepts stored, imported, or edited data and returns complete, clamped settings. */
export function normalizeHoldSettings(value: unknown): HoldSettings {
  const source = (typeof value === 'object' && value !== null ? value : {}) as Partial<Record<HoldGroup, unknown>>;
  return Object.fromEntries(HOLD_GROUPS.map(group => [group, normalizeRule(source[group], DEFAULT_HOLD_SETTINGS[group])])) as HoldSettings;
}
