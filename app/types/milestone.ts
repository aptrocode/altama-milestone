export const SECTION_IDS = ['left', 'center', 'right'] as const;

export type SectionId = typeof SECTION_IDS[number];
export type MilestonePhase = 'IDLE' | 'REVEALING' | 'ACTIVE' | 'HIDING';
export type AssetStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface MilestoneArtworkSource {
  sketch: string;
  color: string;
  width: number;
  height: number;
}

export interface Milestone {
  id: string;
  section: SectionId;
  year: string;
  title: string;
  description: string;
  accent: string;
  contentStatus: 'placeholder' | 'approved';
  artwork: MilestoneArtworkSource;
}

export interface SectionState {
  phase: MilestonePhase;
  currentId: string;
  pendingId: string | null;
  assetStatus: AssetStatus;
  targetStatus: AssetStatus;
  error: string | null;
}

export type SectionStatePatch = Partial<Omit<SectionState, 'currentId'>> & {
  currentId?: string;
};

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TimelineHitbox extends Rect {
  milestoneId: string;
}

export interface SectionLayout {
  section: Rect;
  artwork: Rect;
  timeline: TimelineHitbox[];
}

export interface InstallationLayout {
  layoutVersion: string;
  canvas: {
    width: number;
    height: number;
  };
  sections: Record<SectionId, SectionLayout>;
}
