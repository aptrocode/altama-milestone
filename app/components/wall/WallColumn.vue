<script setup lang="ts">
import type { ColumnId, ColumnSnapshot, WallAction } from '../../../shared/wall';
import type { ColumnConfig } from '~/types/wall-content';
import { computed, ref, watch } from 'vue';
import WallColumnPill from '~/components/wall/WallColumnPill.vue';
import WallHoldButton from '~/components/wall/WallHoldButton.vue';
import WallIdleFrame from '~/components/wall/WallIdleFrame.vue';
import WallOpenCard from '~/components/wall/WallOpenCard.vue';
import { getColumnLayout, installationLayout, rectStyle } from '~/data/installation-layout';
import { getColumnPages } from '~/data/wall-config';
import { WALL_COPY } from '~/data/wall-copy';
import { useSettingsStore } from '~/stores/settings';

/**
 * One column in logical canvas units. Idle shows WallIdleFrame (mockup 1); open shows the raised
 * pill, sub-item name, WallOpenCard, and Back (mockup 2). `origin` shifts the section for the
 * stacked mobile layout; on the LED wall it stays at the canvas origin.
 */
const props = withDefaults(defineProps<{
  column: ColumnConfig;
  snapshot: ColumnSnapshot;
  copy: { label: string; activeLabel: string };
  origin?: { x: number; y: number };
  /** Dashboard card offset in logical px (LED wall only): moves the whole column up or down. */
  offsetY?: number;
}>(), { origin: () => ({ x: 0, y: 0 }), offsetY: 0 });
const emit = defineEmits<{ action: [action: WallAction]; activity: [id: ColumnId]; cardBottom: [y: number] }>();

const settings = useSettingsStore();
const geometry = computed(() => getColumnLayout(props.column.id));
const visual = installationLayout.visual;
const idle = computed(() => props.snapshot.phase === 'idle');
const pages = computed(() => getColumnPages(props.column, props.snapshot.subItem));
const openSubItem = computed(() => props.column.type === 'expandable' && !idle.value
  ? props.column.subItems?.find(sub => sub.key === props.snapshot.subItem)
  : undefined);
// Each column moves only its own title: inside the idle frame, or above the open card. Single
// columns have no sub-item name, so their open pill sits right above the card.
const pillStyle = computed(() => rectStyle(idle.value
  ? visual.idlePill
  : props.column.type === 'expandable' ? visual.activePill : visual.activePillSingle));

// The open card grows with its content (WallOpenCard reports the height it needs) between the
// layout's card height and visual.openCardMaxBottom; the glow rails end 22 px below it.
const cardHeight = ref(geometry.value.active.card.height);
function onCardHeight(needed: number) {
  const card = geometry.value.active.card;
  // The on-screen bottom limit stays at openCardMaxBottom whatever the dashboard offset is.
  cardHeight.value = Math.min(visual.openCardMaxBottom - props.offsetY - card.y, Math.max(card.height, needed));
}
watch([idle, () => props.snapshot.subItem, () => props.offsetY], () => {
  cardHeight.value = geometry.value.active.card.height;
});
const cardBottom = computed(() => geometry.value.active.card.y + cardHeight.value);
watch(cardBottom, bottom => emit('cardBottom', bottom), { immediate: true });
const cardStyle = computed(() => ({
  ...rectStyle(geometry.value.active.card, geometry.value.section),
  height: `calc(${cardHeight.value} * var(--wall-y))`,
}));
const railStyle = computed(() => ({
  top: `calc(${visual.rail.y} * var(--wall-y))`,
  height: `calc(${cardBottom.value + 22 - visual.rail.y} * var(--wall-y))`,
}));

function act(action: WallAction) {
  emit('action', action);
}
</script>

<template>
  <section
    class="wall-column absolute text-wall-ink transition-[top] duration-500 ease-out motion-reduce:transition-none" :style="rectStyle(geometry.section, { x: origin.x, y: origin.y - offsetY })"
    :data-col="column.id" :data-phase="snapshot.phase" :lang="snapshot.locale" :aria-label="copy.label"
    @pointerdown.capture="$emit('activity', column.id)" @keydown.capture="$emit('activity', column.id)"
  >
    <Transition
      enter-active-class="transition duration-500 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100"
      leave-active-class="transition duration-300 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0"
    >
      <div
        v-if="!idle" class="wall-rails pointer-events-none absolute -inset-x-[calc(8*var(--wall-x))] transition-[height] duration-300 ease-out motion-reduce:transition-none"
        :style="railStyle" aria-hidden="true"
      >
        <span class="absolute inset-y-0 left-0 w-[calc(3*var(--wall-x))] bg-linear-to-b from-transparent via-wall-glow/70 to-transparent shadow-[0_0_calc(12*var(--wall-x))_rgba(102,204,255,0.7)]" />
        <span class="absolute inset-y-0 right-0 w-[calc(3*var(--wall-x))] bg-linear-to-b from-transparent via-wall-glow/70 to-transparent shadow-[0_0_calc(12*var(--wall-x))_rgba(102,204,255,0.7)]" />
      </div>
    </Transition>

    <Transition
      enter-active-class="transition duration-300 ease-out delay-150" enter-from-class="opacity-0" enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0"
    >
      <WallIdleFrame
        v-if="idle" class="absolute" :style="rectStyle(geometry.card, geometry.section)"
        :column="column" :locale="snapshot.locale" :label="copy.label" @action="act"
      />
    </Transition>

    <WallColumnPill
      class="absolute z-10 transition-[top] duration-500 ease-out motion-reduce:transition-none" :class="idle ? 'pointer-events-none' : ''"
      :style="pillStyle" :icon="column.icon" :label="copy.label"
    />

    <Transition
      enter-active-class="transition duration-300 ease-out delay-200" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0"
    >
      <div v-if="openSubItem" class="absolute flex items-center justify-center pointer-events-none" :style="rectStyle(visual.subtitle)">
        <img
          v-if="openSubItem.wordmark" :src="openSubItem.wordmark.src" :alt="copy.activeLabel"
          class="max-w-[calc(300*var(--wall-x))] h-[calc(92*var(--wall-y))] object-contain"
        >
        <span v-else class="text-[length:calc(32*var(--wall-u))] font-extrabold uppercase tracking-wide text-white drop-shadow-[0_0_calc(12*var(--wall-x))_rgba(102,204,255,0.9)]">
          {{ copy.activeLabel }}
        </span>
      </div>
    </Transition>

    <Transition
      enter-active-class="transition duration-300 ease-out delay-150" enter-from-class="opacity-0 translate-y-3" enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0"
    >
      <WallOpenCard
        v-if="!idle" class="absolute transition-[height] duration-300 ease-out motion-reduce:transition-none" :style="cardStyle"
        :column-id="column.id" :pages="pages" :locale="snapshot.locale" :photo="snapshot.photo" :page="snapshot.page"
        :geometry="geometry.active" :show-arrows="settings.wall.showArrows" @action="act" @height="onCardHeight"
      />
    </Transition>

    <Transition
      enter-active-class="transition duration-300 delay-300" enter-from-class="opacity-0 scale-75" enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0"
    >
      <WallHoldButton
        v-if="!idle && settings.wall.showClose" :outline="geometry.active.back" group="back" :radius="22"
        class="wall-back absolute z-20 flex items-center justify-center rounded-full bg-[#0b1a78] ring-2 ring-[#bfe8ff] shadow-[0_0_calc(12*var(--wall-x))_rgba(102,204,255,0.8)] text-white text-[length:calc(20*var(--wall-u))] hover:bg-red-500 cursor-pointer"
        :style="rectStyle(geometry.active.back, geometry.section)"
        :aria-label="WALL_COPY[snapshot.locale].back" data-sensor-action="back"
        @activate="act({ type: 'back', columnId: column.id })"
      >
        <span aria-hidden="true">✕</span>
      </WallHoldButton>
    </Transition>
  </section>
</template>
