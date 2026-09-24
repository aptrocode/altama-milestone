import { describe, expect, it } from 'vitest';
import { installationLayout } from '../app/data/installation-layout';
import { initialMilestoneId, milestonesBySection } from '../app/data/milestones';
import { LOCALES, SECTION_IDS } from '../app/types/milestone';

describe('milestone catalog and layout', () => {
  it('keeps sensor timeline targets synchronized with every selectable milestone', () => {
    for (const section of SECTION_IDS) {
      expect(installationLayout.sections[section].timeline.map(item => item.milestoneId))
        .toEqual(milestonesBySection[section].map(item => item.id));
      expect(milestonesBySection[section].some(item => item.id === initialMilestoneId[section])).toBe(true);
    }
  });

  it('keeps two milestones in the same year independently addressable', () => {
    const sameYear = milestonesBySection.center.filter(item => item.year === '2013');
    expect(sameYear).toHaveLength(2);
    expect(new Set(sameYear.map(item => item.id)).size).toBe(2);
  });

  it('gives each section three separate language targets below its timeline', () => {
    expect(installationLayout.layoutVersion).toBe('layout-v4');
    for (const section of SECTION_IDS) {
      const layout = installationLayout.sections[section];
      expect(layout.languages.map(item => item.locale)).toEqual([...LOCALES]);
      expect(layout.languages.every(item => item.y >= Math.max(...layout.timeline.map(year => year.y + year.height)))).toBe(true);
    }
  });
});
