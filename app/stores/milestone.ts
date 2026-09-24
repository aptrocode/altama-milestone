import type { Locale, SectionId, SectionState, SectionStatePatch } from '~/types/milestone';
import { defineStore } from 'pinia';
import { initialMilestoneId } from '~/data/milestones';

function createSectionState(section: SectionId): SectionState {
  return {
    locale: 'id',
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
    setLocale(section: SectionId, locale: Locale) {
      this.sections[section].locale = locale;
    },
    patchSection(section: SectionId, patch: SectionStatePatch) {
      Object.assign(this.sections[section], patch);
    },
  },
});
