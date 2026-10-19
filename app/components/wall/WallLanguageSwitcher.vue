<script setup lang="ts">
import type { ColumnId, WallLocale } from '../../../shared/wall';
import type { Rect } from '~/data/installation-layout';
import { computed } from 'vue';
import WallHoldButton from '~/components/wall/WallHoldButton.vue';
import { rectStyle } from '~/data/installation-layout';
import { FLAG_SOURCES, WALL_COPY } from '~/data/wall-copy';

const props = defineProps<{
  columnId: ColumnId;
  locale: WallLocale;
  bar: Rect;
  targets: (Rect & { locale: WallLocale })[];
}>();
defineEmits<{ select: [locale: WallLocale] }>();

// Buttons are pills concentric with the pill bar: half their height equals the bar radius minus its
// padding (compact 31 − 7 = 24, full width 38 − 8 = 30).
function radius(target: Rect) {
  return target.height / 2;
}

// The bar's corners are concentric with its buttons: their radius plus the bar padding (a pill for
// one row, a rounded rectangle for the 2 + 1 grid).
const barRadius = computed(() => {
  const first = props.targets[0];
  return first ? radius(first) + (first.y - props.bar.y) : 0;
});

function buttonStyle(target: Rect) {
  const r = radius(target);
  return { ...rectStyle(target, props.bar), borderRadius: `calc(${r} * var(--wall-x)) / calc(${r} * var(--wall-y))` };
}
</script>

<template>
  <fieldset
    class="wall-language-bar m-0 p-0 min-w-0 bg-[#050d4f]/90 ring-2 ring-wall-glow/70 shadow-[0_0_calc(16*var(--wall-x))_rgba(80,190,255,0.55)]"
    role="group" :aria-label="WALL_COPY[locale].language"
    :style="{ borderRadius: `calc(${barRadius} * var(--wall-x)) / calc(${barRadius} * var(--wall-y))` }"
  >
    <WallHoldButton
      v-for="target in targets" :key="target.locale" :outline="target" group="language" :radius="radius(target)"
      class="wall-flag absolute flex items-center justify-center cursor-pointer transition-[box-shadow,background-color] duration-150"
      :class="locale === target.locale ? 'bg-white/15 ring-2 ring-wall-glow shadow-[0_0_calc(12*var(--wall-x))_rgba(102,204,255,0.8)]' : 'hover:bg-white/10'"
      :style="buttonStyle(target)"
      :aria-label="WALL_COPY[locale].languages[target.locale]" :title="WALL_COPY[locale].languages[target.locale]"
      :aria-pressed="locale === target.locale" :data-col="columnId" data-sensor-action="language"
      :data-locale="target.locale" @activate="$emit('select', target.locale)"
    >
      <!-- 3:2 flag at two thirds of the button height: 48 × 32 compact, larger in the full-width bar. -->
      <img
        :src="FLAG_SOURCES[target.locale]" alt="" class="object-cover pointer-events-none"
        :style="{ width: `calc(${target.height} * var(--wall-x))`, height: `calc(${target.height * 2 / 3} * var(--wall-y))` }"
      >
    </WallHoldButton>
  </fieldset>
</template>
