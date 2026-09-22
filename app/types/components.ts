import type { Milestone } from './milestone';

export interface MilestoneArtworkHandle {
  stage: (milestone: Milestone) => Promise<void>;
  commit: () => Promise<void>;
}

export interface MilestoneSectionHandle {
  reveal: () => Promise<void>;
  selectMilestone: (id: string) => void;
  reset: () => void;
}
