import type { WallAction } from '../shared/wall';
import { getActionRects, installationLayout } from '../app/data/installation-layout';

export function sensorInput(action: WallAction, overrides: Record<string, unknown> = {}) {
  const rect = getActionRects(action)[0]!;
  return JSON.stringify({
    version: 2,
    sessionId: 'service-1',
    seq: 1,
    layoutVersion: installationLayout.layoutVersion,
    type: 'input',
    action,
    pointerId: 'pointer-1',
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
    ...overrides,
  });
}
