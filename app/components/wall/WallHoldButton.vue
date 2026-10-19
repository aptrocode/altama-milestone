<script setup lang="ts">
import type { HoldGroup } from '../../../shared/hold-settings';
import type { Rect } from '~/data/installation-layout';
import { computed } from 'vue';
import { useSettingsStore } from '~/stores/settings';

/** A wall button whose hold rule (on/off, seconds) comes from the operator dashboard group. */
const props = defineProps<{ outline: Rect; group: HoldGroup; radius?: number; bottomCornersOnly?: boolean }>();
const emit = defineEmits<{ activate: [] }>();
const settings = useSettingsStore();
const rule = computed(() => settings.holdRule(props.group));
const hold = computed(() => ({
  onActivate: () => emit('activate'),
  enabled: rule.value.enabled,
  durationMs: Math.round(rule.value.seconds * 1000),
}));

// Keep the stroke inside the button and its arcs aligned with the CSS corners.
const outlinePath = computed(() => {
  const edge = 2.5;
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

const perimeter = computed(() => {
  const edge = 2.5;
  const w = Math.max(0, props.outline.width - edge * 2);
  const h = Math.max(0, props.outline.height - edge * 2);
  const r = Math.max(0, (props.radius || 0) - edge);
  const arcCount = props.bottomCornersOnly ? 2 : 4;
  const straightW = props.bottomCornersOnly ? w : Math.max(0, w - 2 * r);
  const straightH = Math.max(0, h - (props.bottomCornersOnly ? r : 2 * r));
  const arcLen = (arcCount * 0.5 * Math.PI * r);
  return Math.ceil(2 * straightW + 2 * straightH + arcLen);
});
</script>

<template>
  <button
    v-hold="hold" type="button"
    class="group/hold cursor-pointer transition-colors duration-150"
    :style="{ '--hold-duration': `${hold.durationMs}ms`, '--path-length': `${perimeter}px` }" :data-hold-group="group" :data-hold="rule.enabled ? 'on' : 'off'"
  >
    <slot />
    <div
      class="hold-inset pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-200 opacity-0 group-[.holding]/hold:opacity-100 group-[.hold-complete]/hold:opacity-100 z-10"
      aria-hidden="true"
    />
    <svg
      class="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible" :viewBox="`0 0 ${outline.width} ${outline.height}`"
      preserveAspectRatio="none" aria-hidden="true" focusable="false"
    >
      <path
        :d="outlinePath" stroke-width="5" stroke-linecap="round"
        class="hold-outline fill-none stroke-cyan-300 opacity-0 group-[.holding]/hold:opacity-100 group-[.hold-complete]/hold:opacity-100 group-[.hold-complete]/hold:[stroke-dashoffset:0] motion-reduce:group-[.holding]/hold:[stroke-dashoffset:0]"
        :style="{ strokeDasharray: `${perimeter}px`, strokeDashoffset: `${perimeter}px` }"
      />
    </svg>
  </button>
</template>

<style scoped>
.hold-outline {
  filter: drop-shadow(0 0 calc(6 * var(--wall-x, 1px)) rgba(56, 189, 248, 0.95))
    drop-shadow(0 0 calc(14 * var(--wall-x, 1px)) rgba(6, 182, 212, 0.75));
}

.hold-inset {
  box-shadow:
    inset 0 0 calc(36 * var(--wall-x, 1px)) rgba(102, 204, 255, 0.34),
    inset 0 0 calc(12 * var(--wall-x, 1px)) rgba(56, 160, 255, 0.34),
    inset 0 calc(4 * var(--wall-y, 1px)) calc(18 * var(--wall-y, 1px)) rgba(0, 0, 40, 0.2);
}

/* Vue scopes the keyframe name and this reference together. */
@media (prefers-reduced-motion: no-preference) {
  .holding .hold-outline {
    animation: hold-border var(--hold-duration) linear forwards;
  }
  .holding .hold-inset {
    animation: hold-inset-anim var(--hold-duration) ease-out forwards;
  }
}

@keyframes hold-border {
  from { stroke-dashoffset: var(--path-length); }
  to { stroke-dashoffset: 0; }
}

@keyframes hold-inset-anim {
  0% {
    box-shadow:
      inset 0 0 calc(12 * var(--wall-x, 1px)) rgba(102, 204, 255, 0.14),
      inset 0 calc(2 * var(--wall-y, 1px)) calc(8 * var(--wall-y, 1px)) rgba(0, 0, 40, 0.08);
  }
  100% {
    box-shadow:
      inset 0 0 calc(36 * var(--wall-x, 1px)) rgba(102, 204, 255, 0.34),
      inset 0 0 calc(12 * var(--wall-x, 1px)) rgba(56, 160, 255, 0.34),
      inset 0 calc(4 * var(--wall-y, 1px)) calc(18 * var(--wall-y, 1px)) rgba(0, 0, 40, 0.2);
  }
}
</style>
