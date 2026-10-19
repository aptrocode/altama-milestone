/**
 * Operator wall settings edited on /dashboard next to the hold rules. The card offset is also
 * published to Sensor Service, which shifts its touch targets by the same amount.
 * - resetSeconds: an open (or translated) column returns to idle/Indonesian after this long
 *   without interaction; one value for every column.
 * - cardOffsetY: logical px added to every column's frame, title, card, and controls on the LED
 *   wall (negative moves them up). The stacked phone/tablet layout ignores it.
 * - showClose: whether open cards show their close (✕) button. When off, Sensor Service drops the
 *   Back touch target too; columns still close on inactivity, operator keys, and OSC.
 * - showArrows: whether open cards show their photo slider arrows. When off, Sensor Service drops
 *   the previous/next targets and photos advance on their own every autoSlideSeconds.
 * - autoSlideSeconds: auto-slide interval while the arrows are off.
 */
export interface WallSettings {
  resetSeconds: number;
  cardOffsetY: number;
  showClose: boolean;
  showArrows: boolean;
  autoSlideSeconds: number;
}

export const RESET_SECONDS = { min: 5, max: 600, step: 1 } as const;
export const CARD_OFFSET_Y = { min: -120, max: 120, step: 2 } as const;
export const AUTO_SLIDE_SECONDS = { min: 2, max: 60, step: 1 } as const;

export const DEFAULT_WALL_SETTINGS: WallSettings = { resetSeconds: 30, cardOffsetY: 0, showClose: true, showArrows: true, autoSlideSeconds: 5 };

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
    showClose: typeof source.showClose === 'boolean' ? source.showClose : DEFAULT_WALL_SETTINGS.showClose,
    showArrows: typeof source.showArrows === 'boolean' ? source.showArrows : DEFAULT_WALL_SETTINGS.showArrows,
    autoSlideSeconds: clampNumber(source.autoSlideSeconds, DEFAULT_WALL_SETTINGS.autoSlideSeconds, AUTO_SLIDE_SECONDS),
  };
}
