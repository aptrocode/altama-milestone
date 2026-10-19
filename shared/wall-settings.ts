/**
 * Operator wall settings edited on /dashboard next to the hold rules. The card offset is also
 * published to Sensor Service, which shifts its touch targets by the same amount.
 * - resetSeconds: an open (or translated) column returns to idle/Indonesian after this long
 *   without interaction; one value for every column.
 * - cardOffsetY: logical px added to every column's frame, title, card, and controls on the LED
 *   wall (negative moves them up). The stacked phone/tablet layout ignores it.
 */
export interface WallSettings {
  resetSeconds: number;
  cardOffsetY: number;
}

export const RESET_SECONDS = { min: 5, max: 600, step: 1 } as const;
export const CARD_OFFSET_Y = { min: -120, max: 120, step: 2 } as const;

export const DEFAULT_WALL_SETTINGS: WallSettings = { resetSeconds: 30, cardOffsetY: 0 };

function clampNumber(value: unknown, fallback: number, limits: { min: number; max: number; step: number }): number {
  const raw = typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  const clamped = Math.min(limits.max, Math.max(limits.min, raw));
  return Math.round(clamped / limits.step) * limits.step;
}

/** Accepts stored, imported, edited, or published data and returns complete, clamped settings. */
export function normalizeWallSettings(value: unknown): WallSettings {
  const source = (typeof value === 'object' && value !== null ? value : {}) as Partial<WallSettings>;
  return {
    resetSeconds: clampNumber(source.resetSeconds, DEFAULT_WALL_SETTINGS.resetSeconds, RESET_SECONDS),
    cardOffsetY: clampNumber(source.cardOffsetY, DEFAULT_WALL_SETTINGS.cardOffsetY, CARD_OFFSET_Y),
  };
}
