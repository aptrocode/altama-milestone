import type { ColumnId, WallLocale } from './wall';
import rawLayout from './installation-layout.json';

export interface Rect { x: number; y: number; width: number; height: number }

export interface ActiveColumnLayout {
  card: Rect;
  back: Rect;
  previous: Rect;
  next: Rect;
  pages: (Rect & { page: number })[];
}

export interface ColumnLayout {
  id: ColumnId;
  section: Rect;
  /** Idle frame. */
  card: Rect;
  /** Idle hold target of single columns; expandable columns use their sub-item tiles instead. */
  main?: Rect;
  languageBar: Rect;
  languages: (Rect & { locale: WallLocale })[];
  /** Idle sub-item tiles of expandable columns. */
  subItems?: (Rect & { key: string })[];
  active: ActiveColumnLayout;
}

export interface VisualLayout {
  logo: { idle: { y: number; height: number } };
  idlePill: Rect;
  /** Open pill of expandable columns, leaving room for the sub-item name above the card. */
  activePill: Rect;
  /** Open pill of single columns, 20 px above the card (no sub-item name). */
  activePillSingle: Rect;
  subtitle: Rect;
  artwork: Rect;
  photo: Rect;
  textTop: { tabs: number; photo: number; plain: number };
  /** Lowest bottom edge of an open card; cards grow with their content from `active.card.height` up to it. */
  openCardMaxBottom: number;
  /** Window into one column for the stacked (mobile/tablet) layout, in logical units. */
  stacked: {
    padX: number;
    idle: { y: number; height: number };
    open: { y: number; height: number };
    openSingle: { y: number; height: number };
  };
}

export interface InstallationLayout {
  layoutVersion: string;
  protocolVersion: number;
  canvas: { width: number; height: number };
  frame: { inset: number; gap: number; columnWidth: number };
  visual: VisualLayout;
  columns: ColumnLayout[];
}

export const installationLayout = rawLayout as InstallationLayout;
