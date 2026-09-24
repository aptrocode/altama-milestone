import { createPinia, setActivePinia } from 'pinia';
import { describe, expect, it } from 'vitest';
import { getMilestoneCopy, getSectionCopy, interfaceCopy } from '../app/data/localization';
import { milestones } from '../app/data/milestones';
import { useMilestoneStore } from '../app/stores/milestone';
import { LOCALES, SECTION_IDS } from '../app/types/milestone';

describe('section localization', () => {
  it('starts in Indonesian and switches only the selected section', () => {
    setActivePinia(createPinia());
    const store = useMilestoneStore();

    store.setLocale('left', 'zh-Hans');
    expect(store.sections.left.locale).toBe('zh-Hans');
    expect(store.sections.center.locale).toBe('id');
    expect(store.sections.right.locale).toBe('id');

    store.setLocale('right', 'en');
    expect(store.sections.left.locale).toBe('zh-Hans');
    expect(store.sections.right.locale).toBe('en');
  });

  it('provides complete section and milestone copy in every supported language', () => {
    for (const locale of LOCALES) {
      expect(Object.values(interfaceCopy[locale]).every(Boolean)).toBe(true);
      for (const section of SECTION_IDS) {
        const copy = getSectionCopy(section, locale);
        expect(copy.title).toBeTruthy();
        expect(copy.subtitle).toBeTruthy();
        expect(copy.valuesTitle).toBeTruthy();
        expect(copy.values).toHaveLength(3);
        expect(copy.values.every(value => value.text)).toBe(true);
      }
      for (const milestone of milestones) {
        const copy = getMilestoneCopy(milestone, locale);
        expect(copy.title).toBeTruthy();
        expect(copy.description).toBeTruthy();
      }
    }
  });

  it('requires explicit translations before approved stories are shown', () => {
    const year = milestones.find(item => item.id === 'left-1996')!;
    expect(() => getMilestoneCopy({ ...year, contentStatus: 'approved' }, 'en'))
      .toThrow('Missing en translation');
  });
});
