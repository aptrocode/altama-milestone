/**
 * Operator font settings for the wall (dashboard → Font). Sizes are logical px on the 2304 × 1344
 * canvas (scaled like the rest of the wall); the boxes they sit in are fixed by the layout, so each
 * size has a range that still fits its box.
 * - titleSize / titleWeight: column title in the pill (TENTANG ALTAMA …).
 * - subItemSize: the open sub-item's name above the card when it has no wordmark.
 * - captionSize: tile captions on the idle frame (DISTRIBUSI / PEMASARAN).
 * - tabSize: page tabs (1960 / 1996, PAGE 1 / PAGE 2).
 * - cards: open-card copy per card (a single column, or a sub-item of columns 2 and 5): the body
 *   size range. Each page uses the largest size up to `max` that fits the tallest card, never less
 *   than `min`; only a page that does not fit even at `min` shrinks further (never clipped), which
 *   the dashboard flags.
 */
export const CARD_TEXT_KEYS = ['about-altama', 'tekiro', 'ryu', 'rexco', 'infrastructure', 'digital-partners', 'distribusi', 'pemasaran', 'summit-2026'] as const;
export type CardTextKey = typeof CARD_TEXT_KEYS[number];

export interface CardText {
  /** Smallest body size in logical px (used when the text is long). */
  min: number;
  /** Largest body size in logical px (used when the card has room). */
  max: number;
}

export interface FontSettings {
  titleSize: number;
  titleWeight: number;
  subItemSize: number;
  captionSize: number;
  tabSize: number;
  cards: Record<CardTextKey, CardText>;
}

type SizeKey = Exclude<keyof FontSettings, 'titleWeight' | 'cards'>;

export const FONT_SIZE_LIMITS: Record<SizeKey, { min: number; max: number; step: number }> = {
  titleSize: { min: 20, max: 34, step: 1 },
  subItemSize: { min: 24, max: 40, step: 1 },
  captionSize: { min: 22, max: 36, step: 1 },
  tabSize: { min: 16, max: 28, step: 1 },
};

export const CARD_TEXT_LIMITS = { min: 14, max: 40, step: 1 } as const;
/** Body size the card-copy spacing is designed at; other sizes scale it proportionally. */
export const BASE_BODY_SIZE = 18;

/** Roboto weights loaded by @nuxt/fonts (nuxt.config.ts). */
export const FONT_WEIGHTS = [400, 500, 700, 800, 900] as const;

/** Every card: 24 px at least, up to 26 px when the card has room (client request). */
const RANGE: CardText = { min: 24, max: 26 };

export const DEFAULT_FONT_SETTINGS: FontSettings = {
  titleSize: 27,
  titleWeight: 700,
  subItemSize: 32,
  captionSize: 30,
  tabSize: 24,
  cards: {
    'about-altama': RANGE,
    'tekiro': RANGE,
    'ryu': RANGE,
    'rexco': RANGE,
    'infrastructure': RANGE,
    'digital-partners': RANGE,
    'distribusi': RANGE,
    'pemasaran': RANGE,
    'summit-2026': RANGE,
  },
};

function clamp(value: unknown, fallback: number, limits: { min: number; max: number; step: number }) {
  const raw = typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  return Math.round(Math.min(limits.max, Math.max(limits.min, raw)) / limits.step) * limits.step;
}

function normalizeCards(value: unknown): Record<CardTextKey, CardText> {
  const source = (typeof value === 'object' && value !== null ? value : {}) as Partial<Record<CardTextKey, Partial<CardText>>>;
  return Object.fromEntries(CARD_TEXT_KEYS.map((key) => {
    const fallback = DEFAULT_FONT_SETTINGS.cards[key];
    const card = source[key] ?? {};
    const min = clamp(card.min, fallback.min, CARD_TEXT_LIMITS);
    return [key, { min, max: Math.max(min, clamp(card.max, fallback.max, CARD_TEXT_LIMITS)) }];
  })) as Record<CardTextKey, CardText>;
}

/** Accepts stored, imported, or edited data and returns complete, clamped font settings. */
export function normalizeFontSettings(value: unknown): FontSettings {
  const source = (typeof value === 'object' && value !== null ? value : {}) as Partial<FontSettings>;
  const sizes = Object.fromEntries((Object.keys(FONT_SIZE_LIMITS) as SizeKey[])
    .map(key => [key, clamp(source[key], DEFAULT_FONT_SETTINGS[key], FONT_SIZE_LIMITS[key])])) as Record<SizeKey, number>;
  const weight = FONT_WEIGHTS.includes(source.titleWeight as typeof FONT_WEIGHTS[number])
    ? source.titleWeight as number
    : DEFAULT_FONT_SETTINGS.titleWeight;
  return { ...sizes, titleWeight: weight, cards: normalizeCards(source.cards) };
}

/** Which card-text setting an open card uses: the sub-item for columns 2 and 5, else the column. */
export function cardTextKey(columnKey: string, subItem: string): CardTextKey | undefined {
  const key = (subItem || columnKey) as CardTextKey;
  return CARD_TEXT_KEYS.includes(key) ? key : undefined;
}
