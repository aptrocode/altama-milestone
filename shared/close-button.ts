import type { Rect } from './installation-layout';

/**
 * Close (✕) button geometry from the dashboard, in two places (`position`):
 * - `bottom` (default, client request): a capsule as wide as the open card (74 tall), 10 px
 *   under the idle frame (so it follows the language bar's frame extension and the card offset);
 * - `corner`: the layout's 44 px badge on the open card's top-right corner, where `scale` grows it
 *   around its own centre and `x` / `y` (logical px) move it.
 * The wall drawing, wall input validation, Sensor Service's Back target, and OSC show control all
 * use `closeTargetRect`, so they stay the same rectangle. Derived from wall-v7, so the layout
 * version is unchanged.
 */
export const CLOSE_POSITIONS = ['bottom', 'corner'] as const;
export type ClosePosition = typeof CLOSE_POSITIONS[number];

export interface CloseButtonOptions { scale: number; x: number; y: number; position?: ClosePosition }

/** The bottom close capsule: as wide as the open card, 74 tall (client request), 10 px under the idle frame. */
export const BOTTOM_CLOSE = { height: 74, gap: 10 } as const;

export const CLOSE_SCALE = { min: 1, max: 2, step: 0.1 } as const;
export const CLOSE_OFFSET = { min: -60, max: 60, step: 2 } as const;
export const DEFAULT_CLOSE_BUTTON: CloseButtonOptions = { scale: 1, x: 0, y: 0 };

/** The bottom close capsule: the open card's width, under an idle frame (extended by the language bar). */
export function bottomCloseRect(frame: Rect, card: Rect): Rect {
  return {
    x: card.x,
    y: frame.y + frame.height + BOTTOM_CLOSE.gap,
    width: card.width,
    height: BOTTOM_CLOSE.height,
  };
}

/**
 * The Back target of a column: the bottom pill (under the idle frame grown by `frameExtend`, the
 * language bar's extension) or the corner badge. Callers without a position (older walls) get the
 * corner badge.
 */
export function closeTargetRect(column: { card: Rect; active: { back: Rect; card: Rect } }, close: CloseButtonOptions = DEFAULT_CLOSE_BUTTON, frameExtend = 0): Rect {
  if (close.position === 'bottom')
    return bottomCloseRect({ ...column.card, height: column.card.height + frameExtend }, column.active.card);
  return closeButtonRect(column.active.back, close);
}

export function closeButtonRect<T extends Rect>(back: T, close: CloseButtonOptions = DEFAULT_CLOSE_BUTTON): T {
  const { scale, x, y } = close;
  if (scale === 1 && !x && !y)
    return back;
  const width = back.width * scale;
  const height = back.height * scale;
  return { ...back, x: back.x + (back.width - width) / 2 + x, y: back.y + (back.height - height) / 2 + y, width, height };
}
