/**
 * Language bar geometry for the dashboard `languageBar` mode. `compact` is the layout file's pill
 * (three 64 × 48 flags in the middle of the frame); `full` stretches the pill to the frame's inner
 * edges with three equal, larger buttons around the same centre line. Wall and Sensor Service use
 * this one function, so the drawn bar, its touch targets, and input validation always agree; the
 * layout version stays the same because both modes are derived from it.
 */
export type LanguageBarMode = 'compact' | 'full';

export const LANGUAGE_BAR_MODES: readonly LanguageBarMode[] = ['compact', 'full'];

interface Rect { x: number; y: number; width: number; height: number }

/** Logical px between the frame edge and the full-width bar, its height, and button spacing. */
const FULL = { inset: 14, height: 76, padding: 8, gap: 6 } as const;

export function languageGeometry<L extends Rect & { locale: string }>(
  column: { card: Rect; languageBar: Rect; languages: L[] },
  mode: LanguageBarMode = 'compact',
): { languageBar: Rect; languages: L[] } {
  if (mode !== 'full')
    return { languageBar: column.languageBar, languages: column.languages };

  const centreY = column.languageBar.y + column.languageBar.height / 2;
  const bar = {
    x: column.card.x + FULL.inset,
    y: Math.round(centreY - FULL.height / 2),
    width: column.card.width - FULL.inset * 2,
    height: FULL.height,
  };
  const count = column.languages.length;
  const width = (bar.width - FULL.padding * 2 - FULL.gap * (count - 1)) / count;
  const languages = column.languages.map((item, index) => ({
    ...item,
    x: bar.x + FULL.padding + index * (width + FULL.gap),
    y: bar.y + FULL.padding,
    width,
    height: bar.height - FULL.padding * 2,
  }));
  return { languageBar: bar, languages };
}
