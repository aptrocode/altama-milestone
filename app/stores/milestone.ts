import type { SectionId, SectionState, SectionStatePatch } from '~/types/milestone';
import { defineStore } from 'pinia';
import { initialMilestoneId } from '~/data/milestones';

function createSectionState(section: SectionId): SectionState {
  return {
    phase: 'IDLE',
    currentId: initialMilestoneId[section],
    pendingId: null,
    assetStatus: 'loading',
    targetStatus: 'idle',
    error: null,
  };
}

export const useMilestoneStore = defineStore('milestone', {
  state: (): { sections: Record<SectionId, SectionState> } => ({
    sections: {
      left: createSectionState('left'),
      center: createSectionState('center'),
      right: createSectionState('right'),
    },
  }),

  actions: {
    patchSection(section: SectionId, patch: SectionStatePatch) {
      Object.assign(this.sections[section], patch);
    },
  },
});
