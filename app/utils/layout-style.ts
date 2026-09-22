import type { CSSProperties } from 'vue';
import type { Rect } from '~/types/milestone';

export function layoutStyle(rect: Rect, parent: Rect): CSSProperties {
  return {
    left: `${(rect.x - parent.x) / parent.width * 100}%`,
    top: `${(rect.y - parent.y) / parent.height * 100}%`,
    width: `${rect.width / parent.width * 100}%`,
    height: `${rect.height / parent.height * 100}%`,
  };
}
