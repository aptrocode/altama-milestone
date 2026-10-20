/**
 * Close (✕) button size and position from the dashboard: `scale` (1× = the layout's 44 px badge)
 * grows the badge around its own centre on the card's top-right corner, and `x` / `y` (logical px)
 * move it. The wall drawing, wall input validation, Sensor Service's Back target, and OSC show
 * control all use this one function, so they stay the same rectangle. Derived from wall-v7, so the
 * layout version is unchanged.
 */
interface Rect { x: number; y: number; width: number; height: number }

export interface CloseButtonOptions { scale: number; x: number; y: number }

export const CLOSE_SCALE = { min: 1, max: 2, step: 0.1 } as const;
export const CLOSE_OFFSET = { min: -60, max: 60, step: 2 } as const;
export const DEFAULT_CLOSE_BUTTON: CloseButtonOptions = { scale: 1, x: 0, y: 0 };

export function closeButtonRect<T extends Rect>(back: T, close: CloseButtonOptions = DEFAULT_CLOSE_BUTTON): T {
  const { scale, x, y } = close;
  if (scale === 1 && !x && !y)
    return back;
  const width = back.width * scale;
  const height = back.height * scale;
  return { ...back, x: back.x + (back.width - width) / 2 + x, y: back.y + (back.height - height) / 2 + y, width, height };
}
