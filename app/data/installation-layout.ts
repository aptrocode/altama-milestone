import type { InstallationLayout, Rect } from '~/types/milestone';
import { SECTION_IDS } from '~/types/milestone';
import rawLayout from '../../shared/installation-layout.json';
import { getMilestoneForSection } from './milestones';

function isFiniteRect(rect: Rect, canvasWidth: number, canvasHeight: number): boolean {
  return [rect.x, rect.y, rect.width, rect.height].every(Number.isFinite)
    && rect.width > 0
    && rect.height > 0
    && rect.x >= 0
    && rect.y >= 0
    && rect.x + rect.width <= canvasWidth
    && rect.y + rect.height <= canvasHeight;
}

function rectanglesOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width
    && a.x + a.width > b.x
    && a.y < b.y + b.height
    && a.y + a.height > b.y;
}

export function validateInstallationLayout(layout: InstallationLayout): void {
  if (!layout.layoutVersion.trim())
    throw new Error('installation layout requires a layoutVersion');

  if (!Number.isFinite(layout.canvas.width) || !Number.isFinite(layout.canvas.height))
    throw new TypeError('installation canvas dimensions must be finite');

  for (const sectionId of SECTION_IDS) {
    const section = layout.sections[sectionId];
    const rects = [section.section, section.artwork, ...section.timeline];

    if (rects.some(rect => !isFiniteRect(rect, layout.canvas.width, layout.canvas.height)))
      throw new Error(`layout contains an invalid rectangle in ${sectionId}`);

    for (const hitbox of section.timeline) {
      if (!getMilestoneForSection(sectionId, hitbox.milestoneId))
        throw new Error(`layout target ${hitbox.milestoneId} does not belong to ${sectionId}`);
    }

    for (let index = 0; index < section.timeline.length; index++) {
      for (let otherIndex = index + 1; otherIndex < section.timeline.length; otherIndex++) {
        if (rectanglesOverlap(section.timeline[index]!, section.timeline[otherIndex]!))
          throw new Error(`timeline hitboxes overlap in ${sectionId}`);
      }
    }
  }
}

export const installationLayout = rawLayout as InstallationLayout;
validateInstallationLayout(installationLayout);

export function isPointInsideCanvas(x: number, y: number): boolean {
  return x >= 0
    && y >= 0
    && x <= installationLayout.canvas.width
    && y <= installationLayout.canvas.height;
}
