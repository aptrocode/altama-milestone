/**
 * Operator font settings for the wall (dashboard → Font). Sizes are logical px on the 2304 × 1344
 * canvas (scaled like the rest of the wall); the boxes they sit in are fixed by the layout, so each
 * size has a range that still fits its box.
 * - titleSize / titleWeight: column title in the pill (TENTANG ALTAMA …).
 * - subItemSize: the open sub-item's name above the card when it has no wordmark.
 * - captionSize: tile captions on the idle frame (DISTRIBUSI / PEMASARAN).
 * - tabSize: page tabs (1960 / 1996, PAGE 1 / PAGE 2).
 * - bodySize: open-card copy; its glow labels stay 0.82 × this, and long pages still shrink to fit.
 */
export interface FontSettings {
  titleSize: number;
  titleWeight: number;
  subItemSize: number;
  captionSize: number;
  tabSize: number;
  bodySize: number;
}

type SizeKey = Exclude<keyof FontSettings, 'titleWeight'>;

export const FONT_SIZE_LIMITS: Record<SizeKey, { min: number; max: number; step: number }> = {
  titleSize: { min: 20, max: 34, step: 1 },
  subItemSize: { min: 24, max: 40, step: 1 },
  captionSize: { min: 22, max: 36, step: 1 },
  tabSize: { min: 16, max: 28, step: 1 },
  bodySize: { min: 14, max: 24, step: 1 },
};

/** Roboto weights loaded by @nuxt/fonts (nuxt.config.ts). */
export const FONT_WEIGHTS = [400, 500, 700, 800, 900] as const;

export const DEFAULT_FONT_SETTINGS: FontSettings = {
  titleSize: 27,
  titleWeight: 700,
  subItemSize: 32,
  captionSize: 30,
  tabSize: 24,
  bodySize: 18,
};

function clamp(value: unknown, fallback: number, limits: { min: number; max: number; step: number }) {
  const raw = typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  return Math.round(Math.min(limits.max, Math.max(limits.min, raw)) / limits.step) * limits.step;
}

/** Accepts stored, imported, or edited data and returns complete, clamped font settings. */
export function normalizeFontSettings(value: unknown): FontSettings {
  const source = (typeof value === 'object' && value !== null ? value : {}) as Partial<FontSettings>;
  const sizes = Object.fromEntries((Object.keys(FONT_SIZE_LIMITS) as SizeKey[])
    .map(key => [key, clamp(source[key], DEFAULT_FONT_SETTINGS[key], FONT_SIZE_LIMITS[key])])) as Record<SizeKey, number>;
  const weight = FONT_WEIGHTS.includes(source.titleWeight as typeof FONT_WEIGHTS[number])
    ? source.titleWeight as number
    : DEFAULT_FONT_SETTINGS.titleWeight;
  return { ...sizes, titleWeight: weight };
}
