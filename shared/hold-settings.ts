import type { WallAction } from './wall';

/**
 * Operator-configurable hold (dwell) rules, edited on /dashboard and published to Sensor Service.
 * - card: idle main card and sub-item tiles (columns 2/5)
 * - page: page tabs (PAGE 1–4)
 * - slider: photo arrows
 * - language: language flags
 * - back: the open card's close (✕) button
 * Each group has a mode: `tap` (activates on a normal press), `hold` (must be held for `seconds`),
 * or `delay` (a tap starts the hold animation and the button activates after `seconds`, without
 * holding). `enabled` mirrors `mode === 'hold'` for Sensor Service's dwell.
 */
export const HOLD_GROUPS = ['card', 'page', 'slider', 'language', 'back'] as const;
export type HoldGroup = typeof HOLD_GROUPS[number];

export const HOLD_MODES = ['tap', 'hold', 'delay'] as const;
export type HoldMode = typeof HOLD_MODES[number];

export interface HoldRule {
  mode: HoldMode;
  /** mode === 'hold' (kept for Sensor Service, which dwells only on hold). */
  enabled: boolean;
  /** Dwell time when enabled. */
  seconds: number;
}

export type HoldSettings = Record<HoldGroup, HoldRule>;

export const HOLD_SECONDS = { min: 0.3, max: 5, step: 0.1 } as const;

/**
 * Content buttons (opening a card or tile, switching page tabs) default to Tap + delay, 1 s: a tap
 * plays the border animation, then opens. Flags, photo arrows and close are a plain tap, without
 * animation (client request), in Page and Scroll mode alike.
 */
export const DEFAULT_HOLD_SETTINGS: HoldSettings = {
  card: { mode: 'delay', enabled: false, seconds: 1 },
  page: { mode: 'delay', enabled: false, seconds: 1 },
  slider: { mode: 'tap', enabled: false, seconds: 1 },
  language: { mode: 'tap', enabled: false, seconds: 1 },
  back: { mode: 'tap', enabled: false, seconds: 1 },
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
  // Older settings only have `enabled`: true was hold, false was a normal press.
  const mode: HoldMode = HOLD_MODES.includes(rule.mode as HoldMode)
    ? rule.mode as HoldMode
    : typeof rule.enabled === 'boolean' ? (rule.enabled ? 'hold' : 'tap') : fallback.mode;
  return { mode, enabled: mode === 'hold', seconds: Math.round(clamped * 10) / 10 };
}

/** Accepts stored, imported, or edited data and returns complete, clamped settings. */
export function normalizeHoldSettings(value: unknown): HoldSettings {
  const source = (typeof value === 'object' && value !== null ? value : {}) as Partial<Record<HoldGroup, unknown>>;
  return Object.fromEntries(HOLD_GROUPS.map(group => [group, normalizeRule(source[group], DEFAULT_HOLD_SETTINGS[group])])) as HoldSettings;
}
