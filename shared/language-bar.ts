/**
 * Language bar geometry for the dashboard `languageBar` mode. `compact` is the layout file's pill
 * (three 64 × 48 flags in the middle of the frame); `full` stretches the pill to the frame's inner
 * edges with three equal, larger buttons around the same centre line; `grid` keeps the full width
 * but stacks the buttons 2 + 1 (Indonesian left, English right, Chinese centred below), so the
 * idle frame grows downward by `extend`. Wall and Sensor Service use this one function, so the
 * drawn bar, its touch targets, the main target, and input validation always agree; the layout
 * version stays the same because every mode is derived from it.
 */
export type LanguageBarMode = 'compact' | 'full' | 'grid';

export const LANGUAGE_BAR_MODES: readonly LanguageBarMode[] = ['compact', 'full', 'grid'];

interface Rect { x: number; y: number; width: number; height: number }

/** Logical px between the frame edge and the wide bar, button height, and spacing. */
const WIDE = { inset: 14, button: 60, padding: 8, gap: 6 } as const;
/** The 2 + 1 grid sits this much lower than the single-row bars, leaving room under the artwork; the frame grows by it too. */
const GRID_DROP = 10;

export interface LanguageGeometry<L> {
  languageBar: Rect;
  languages: L[];
  /** Logical px the idle frame (and its main target) grows downward to fit the bar. */
  extend: number;
}

export function languageGeometry<L extends Rect & { locale: string }>(
  column: { card: Rect; languageBar: Rect; languages: L[] },
  mode: LanguageBarMode = 'compact',
): LanguageGeometry<L> {
  if (mode !== 'full' && mode !== 'grid')
    return { languageBar: column.languageBar, languages: column.languages, extend: 0 };

  const singleRow = WIDE.button + WIDE.padding * 2;
  const centreY = column.languageBar.y + column.languageBar.height / 2;
  const x = column.card.x + WIDE.inset;
  const y = Math.round(centreY - singleRow / 2);
  const width = column.card.width - WIDE.inset * 2;
  const inner = width - WIDE.padding * 2;

  if (mode === 'full') {
    const count = column.languages.length;
    const buttonWidth = (inner - WIDE.gap * (count - 1)) / count;
    return {
      languageBar: { x, y, width, height: singleRow },
      languages: column.languages.map((item, index) => ({
        ...item,
        x: x + WIDE.padding + index * (buttonWidth + WIDE.gap),
        y: y + WIDE.padding,
        width: buttonWidth,
        height: WIDE.button,
      })),
      extend: 0,
    };
  }

  // grid: two per row, the last row centred (ID | EN, then 中文), a little lower than one row.
  const top = y + GRID_DROP;
  const buttonWidth = (inner - WIDE.gap) / 2;
  const rows = Math.ceil(column.languages.length / 2);
  const height = WIDE.padding * 2 + rows * WIDE.button + (rows - 1) * WIDE.gap;
  const languages = column.languages.map((item, index) => {
    const row = Math.floor(index / 2);
    const alone = row === rows - 1 && column.languages.length % 2 === 1;
    const left = alone ? x + (width - buttonWidth) / 2 : x + WIDE.padding + (index % 2) * (buttonWidth + WIDE.gap);
    return { ...item, x: left, y: top + WIDE.padding + row * (WIDE.button + WIDE.gap), width: buttonWidth, height: WIDE.button };
  });
  return { languageBar: { x, y: top, width, height }, languages, extend: height - singleRow + GRID_DROP };
}

/**
 * Logical px every column moves up in a mode, on top of the dashboard card offset: the 2 + 1 grid
 * makes the idle frame taller, so the whole column sits a little higher.
 */
export const LANGUAGE_BAR_RAISE: Record<LanguageBarMode, number> = { compact: 0, full: 0, grid: 40 };

/** Vertical shift of every column (frame, card, controls, and so every target) on the LED wall. */
export function columnOffsetY(cardOffsetY: number, mode: LanguageBarMode = 'compact'): number {
  return cardOffsetY - LANGUAGE_BAR_RAISE[mode];
}

/** A rect grown downward by `extend` logical px (the idle frame and main target in grid mode). */
export function extendDown<T extends Rect>(rect: T, extend: number): T {
  return extend ? { ...rect, height: rect.height + extend } : rect;
}
