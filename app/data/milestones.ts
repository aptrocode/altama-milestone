import type { Milestone, SectionId } from '~/types/milestone';
import { SECTION_IDS } from '~/types/milestone';
import rawMilestones from '../../shared/milestones.json';
import { sectionPresentation } from './sections';

function artwork(section: SectionId, id: string) {
  const base = `/milestones/${section}/${id}`;

  return {
    sketch: `${base}/sketch.webp`,
    color: `${base}/color.webp`,
  };
}

interface MilestoneRecord extends Omit<Milestone, 'artwork'> {
  artworkWidth: number;
  artworkHeight: number;
}

function isSectionId(value: string): value is SectionId {
  return SECTION_IDS.includes(value as SectionId);
}

export const milestones: readonly Milestone[] = (rawMilestones as MilestoneRecord[]).map((record) => {
  if (!isSectionId(record.section))
    throw new Error(`Invalid milestone section: ${record.section}`);

  return {
    id: record.id,
    section: record.section,
    year: record.year,
    title: record.title,
    description: record.description,
    accent: record.accent,
    contentStatus: record.contentStatus,
    artwork: {
      ...artwork(record.section, record.id),
      width: record.artworkWidth,
      height: record.artworkHeight,
    },
  };
});

const milestoneById = new Map(milestones.map(item => [item.id, item]));

export const milestonesBySection: Record<SectionId, readonly Milestone[]> = {
  left: milestones.filter(item => item.section === 'left'),
  center: milestones.filter(item => item.section === 'center'),
  right: milestones.filter(item => item.section === 'right'),
};

export const initialMilestoneId: Record<SectionId, string> = {
  left: sectionPresentation.left.initialId,
  center: sectionPresentation.center.initialId,
  right: sectionPresentation.right.initialId,
};

export function getMilestone(id: string): Milestone | undefined {
  return milestoneById.get(id);
}

export function getMilestoneForSection(section: SectionId, id: string): Milestone | undefined {
  const milestone = milestoneById.get(id);
  return milestone?.section === section ? milestone : undefined;
}

export function getAdjacentMilestone(section: SectionId, id: string): Milestone | undefined {
  const sectionMilestones = milestonesBySection[section];
  const index = sectionMilestones.findIndex(item => item.id === id);

  if (index < 0 || sectionMilestones.length < 2)
    return undefined;

  return sectionMilestones[(index + 1) % sectionMilestones.length];
}
