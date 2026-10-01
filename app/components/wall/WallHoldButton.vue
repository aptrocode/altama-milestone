<script setup lang="ts">
import type { Rect } from '~/data/installation-layout';
import { computed } from 'vue';
import { HOLD_DURATION_MS } from '~/utils/hold';

const props = defineProps<{ outline: Rect; radius?: number; bottomCornersOnly?: boolean }>();
defineEmits<{ activate: [] }>();

// Keep the stroke inside the button and its arcs aligned with the CSS corners.
const outlinePath = computed(() => {
  const edge = 2;
  const right = props.outline.width - edge;
  const bottom = props.outline.height - edge;
  const lowerRadius = Math.max(0, (props.radius || 0) - edge);
  const upperRadius = props.bottomCornersOnly ? 0 : lowerRadius;
  const corner = (radius: number, x: number, y: number) => radius
    ? `A ${radius} ${radius} 0 0 1 ${x} ${y}`
    : `L ${x} ${y}`;
  return [
    `M ${edge + upperRadius} ${edge} H ${right - upperRadius}`,
    corner(upperRadius, right, edge + upperRadius),
    `V ${bottom - lowerRadius}`,
    corner(lowerRadius, right - lowerRadius, bottom),
    `H ${edge + lowerRadius}`,
    corner(lowerRadius, edge, bottom - lowerRadius),
    `V ${edge + upperRadius}`,
    corner(upperRadius, edge + upperRadius, edge),
    'Z',
  ].join(' ');
});
</script>

<template>
  <button
    v-hold="() => $emit('activate')" type="button"
    class="group/hold relative cursor-pointer transition-colors duration-150"
    :style="{ '--hold-duration': `${HOLD_DURATION_MS}ms` }"
  >
    <slot />
    <svg
      class="absolute inset-0 w-full h-full pointer-events-none" :viewBox="`0 0 ${outline.width} ${outline.height}`"
      preserveAspectRatio="none" aria-hidden="true" focusable="false"
    >
      <path
        :d="outlinePath" pathLength="1" stroke-width="4" stroke-linecap="round"
        class="hold-outline fill-none stroke-emerald-400 opacity-0 [stroke-dasharray:1] [stroke-dashoffset:1] group-[.holding]/hold:opacity-100 group-[.hold-complete]/hold:opacity-100 group-[.hold-complete]/hold:[stroke-dashoffset:0] motion-reduce:group-[.holding]/hold:[stroke-dashoffset:0]"
      />
    </svg>
  </button>
</template>

<style scoped>
/* Vue scopes the keyframe name and this reference together. */
@media (prefers-reduced-motion: no-preference) {
  .holding .hold-outline {
    animation: hold-border var(--hold-duration) linear forwards;
  }
}

@keyframes hold-border {
  from { stroke-dashoffset: 1; }
  to { stroke-dashoffset: 0; }
}
</style>
