import type { CloseButtonOptions, ClosePosition } from './close-button';
import type { LanguageBarMode } from './language-bar';
import { CLOSE_OFFSET, CLOSE_POSITIONS, CLOSE_SCALE } from './close-button';
import { LANGUAGE_BAR_MODES } from './language-bar';

/**
 * Operator wall settings edited on /dashboard next to the hold rules. The card offset is also
 * published to Sensor Service, which shifts its touch targets by the same amount.
 * - resetSeconds: an open (or translated) column returns to idle/Indonesian after this long
 *   without interaction; one value for every column.
 * - cardOffsetY: logical px added to every column's frame, title, card, and controls on the LED
 *   wall (negative moves them up). The stacked phone/tablet layout ignores it.
 * - showClose: whether open cards show their close (✕) button. When off, Sensor Service drops the
 *   Back touch target too; columns still close on inactivity, operator keys, and OSC.
 * - closePosition: `bottom` (default) puts a title-sized close pill under the idle frame and stops
 *   open cards at the frame's bottom; `corner` keeps the badge on the card's top-right corner.
 * - closeScale / closeOffsetX / closeOffsetY: size (1×–2×) and position shift (logical px) of the
 *   close (✕) button (shared/close-button.ts); Sensor Service's Back target follows it.
 * - showArrows: whether open cards show their photo slider arrows. When off, Sensor Service drops
 *   the previous/next targets and photos advance on their own every autoSlideSeconds.
 * - autoSlideSeconds: auto-slide interval while the arrows are off.
 * - showPages: whether open cards show their page tabs. When off, Sensor Service drops the page
 *   targets and pages change on their own every autoPageSeconds.
 * - autoPage: pages also change on their own while the tabs are shown (default on); with the
 *   tabs off they always do (autoPageActive).
 * - autoPageSeconds: auto-page interval (default 15 s).
 * - scrollText: trial of vertically scrolling card text (default off). Every card keeps its Font
 *   Maks size and scrolls; its pages are grouped by `scrollPages` (default one page: Tekiro 2, RYU
 *   and Rexco keep 2); off restores the pages and tabs.
 * - languageBar: `full` width with larger buttons (default), the `compact` flag pill, or the 2 + 1 `grid`
 *   (shared/language-bar.ts); Sensor Service moves the language targets with it.
 * - showTouchDots: calibration overlay on the wall (press/release/sensor dots with coordinates).
 * - touchDotSeconds: how long each touch dot stays after its release (or after a sensor input).
 */
export interface WallSettings {
  resetSeconds: number;
  cardOffsetY: number;
  showClose: boolean;
  closePosition: ClosePosition;
  closeScale: number;
  closeOffsetX: number;
  closeOffsetY: number;
  showArrows: boolean;
  autoSlideSeconds: number;
  showPages: boolean;
  autoPage: boolean;
  autoPageSeconds: number;
  scrollText: boolean;
  languageBar: LanguageBarMode;
  showTouchDots: boolean;
  touchDotSeconds: number;
}

export const RESET_SECONDS = { min: 5, max: 600, step: 1 } as const;
export const CARD_OFFSET_Y = { min: -120, max: 120, step: 2 } as const;
export const AUTO_SLIDE_SECONDS = { min: 2, max: 60, step: 1 } as const;
export const AUTO_PAGE_SECONDS = { min: 3, max: 120, step: 1 } as const;
export const TOUCH_DOT_SECONDS = { min: 1, max: 60, step: 1 } as const;

export const DEFAULT_WALL_SETTINGS: WallSettings = { resetSeconds: 30, cardOffsetY: 0, showClose: true, closePosition: 'bottom', closeScale: 1, closeOffsetX: 0, closeOffsetY: 0, showArrows: true, autoSlideSeconds: 5, showPages: true, autoPage: true, autoPageSeconds: 15, scrollText: false, languageBar: 'full', showTouchDots: false, touchDotSeconds: 5 };

function clampNumber(value: unknown, fallback: number, limits: { min: number; max: number; step: number }): number {
  const raw = typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  const clamped = Math.min(limits.max, Math.max(limits.min, raw));
  return Math.round(Math.round(clamped / limits.step) * limits.step * 1000) / 1000;
}

/** Accepts stored, imported, edited, or published data and returns complete, clamped settings. */
export function normalizeWallSettings(value: unknown): WallSettings {
  const source = (typeof value === 'object' && value !== null ? value : {}) as Partial<WallSettings>;
  return {
    resetSeconds: clampNumber(source.resetSeconds, DEFAULT_WALL_SETTINGS.resetSeconds, RESET_SECONDS),
    cardOffsetY: clampNumber(source.cardOffsetY, DEFAULT_WALL_SETTINGS.cardOffsetY, CARD_OFFSET_Y),
    showClose: typeof source.showClose === 'boolean' ? source.showClose : DEFAULT_WALL_SETTINGS.showClose,
    closePosition: CLOSE_POSITIONS.includes(source.closePosition as ClosePosition) ? source.closePosition as ClosePosition : DEFAULT_WALL_SETTINGS.closePosition,
    closeScale: clampNumber(source.closeScale, DEFAULT_WALL_SETTINGS.closeScale, CLOSE_SCALE),
    closeOffsetX: clampNumber(source.closeOffsetX, DEFAULT_WALL_SETTINGS.closeOffsetX, CLOSE_OFFSET),
    closeOffsetY: clampNumber(source.closeOffsetY, DEFAULT_WALL_SETTINGS.closeOffsetY, CLOSE_OFFSET),
    showArrows: typeof source.showArrows === 'boolean' ? source.showArrows : DEFAULT_WALL_SETTINGS.showArrows,
    autoSlideSeconds: clampNumber(source.autoSlideSeconds, DEFAULT_WALL_SETTINGS.autoSlideSeconds, AUTO_SLIDE_SECONDS),
    showPages: typeof source.showPages === 'boolean' ? source.showPages : DEFAULT_WALL_SETTINGS.showPages,
    autoPage: typeof source.autoPage === 'boolean' ? source.autoPage : DEFAULT_WALL_SETTINGS.autoPage,
    autoPageSeconds: clampNumber(source.autoPageSeconds, DEFAULT_WALL_SETTINGS.autoPageSeconds, AUTO_PAGE_SECONDS),
    scrollText: typeof source.scrollText === 'boolean' ? source.scrollText : DEFAULT_WALL_SETTINGS.scrollText,
    languageBar: LANGUAGE_BAR_MODES.includes(source.languageBar as LanguageBarMode) ? source.languageBar as LanguageBarMode : DEFAULT_WALL_SETTINGS.languageBar,
    showTouchDots: typeof source.showTouchDots === 'boolean' ? source.showTouchDots : DEFAULT_WALL_SETTINGS.showTouchDots,
    touchDotSeconds: clampNumber(source.touchDotSeconds, DEFAULT_WALL_SETTINGS.touchDotSeconds, TOUCH_DOT_SECONDS),
  };
}

/** The close button options of wall settings, as shared/close-button.ts takes them. */
export function closeButtonOptions(settings: Pick<WallSettings, 'closeScale' | 'closeOffsetX' | 'closeOffsetY'> & Partial<Pick<WallSettings, 'closePosition'>>): CloseButtonOptions {
  return { scale: settings.closeScale, x: settings.closeOffsetX, y: settings.closeOffsetY, position: settings.closePosition };
}

/** Pages advance on their own when the operator turned auto page on, or hid the page tabs. */
export function autoPageActive(settings: Pick<WallSettings, 'autoPage' | 'showPages'>): boolean {
  return settings.autoPage || !settings.showPages;
}
