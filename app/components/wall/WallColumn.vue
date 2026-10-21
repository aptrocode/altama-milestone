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
import { closeTargetRect } from '../../../shared/close-button';
import { cardTextKey } from '../../../shared/font-settings';
import { extendDown, languageGeometry } from '../../../shared/language-bar';
import { autoPageActive, closeButtonOptions } from '../../../shared/wall-settings';

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
  /** Idle hint target in this column (`main` or a tile key), if any. */
  hintKey?: string | null;
}>(), { origin: () => ({ x: 0, y: 0 }), offsetY: 0 });
const emit = defineEmits<{ action: [action: WallAction]; activity: [id: ColumnId]; cardBottom: [y: number]; slideEnded: [id: ColumnId] }>();

const settings = useSettingsStore();
const geometry = computed(() => getColumnLayout(props.column.id));
const visual = installationLayout.visual;
const idle = computed(() => props.snapshot.phase === 'idle');
// The 2 + 1 language grid makes the idle frame taller (downward).
// The close badge follows the dashboard size (1×–2×, around its centre) and X/Y shift, like its sensor target.
const closeRect = computed(() => closeTargetRect(geometry.value, closeButtonOptions(settings.wall), languageGeometry(geometry.value, settings.wall.languageBar).extend));
// Default: a title-sized close pill under the idle frame (client request); else the corner badge.
const bottomClose = computed(() => settings.wall.showClose && settings.wall.closePosition === 'bottom');
const idleFrame = computed(() => extendDown(geometry.value.card, languageGeometry(geometry.value, settings.wall.languageBar).extend));
const pages = computed(() => getColumnPages(props.column, props.snapshot.subItem, settings.wall.scrollText));
// Trial: every card's text scrolls vertically (Dashboard → Wall "Scroll teks").
const scroll = computed(() => settings.wall.scrollText);
// Scroll mode keeps section 2's tabbed pages: their tabs show even with Tombol page off.
const tabsAlways = computed(() => scroll.value && pages.value.length > 1);
// Open-card text size and fill come from Dashboard → Font, per card (column or sub-item).
const cardText = computed(() => {
  const key = cardTextKey(props.column.key, props.column.type === 'expandable' ? props.snapshot.subItem : '');
  return key ? settings.fonts.cards[key] : undefined;
});
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
// The on-screen bottom limit stays at openCardMaxBottom whatever the dashboard offset is.
const maxCardHeight = computed(() => visual.openCardMaxBottom - props.offsetY - geometry.value.active.card.y);
// Scroll teks: every open card ends where the idle frame ends (under the flag bar, following the
// language bar mode), so the skyline stays visible; its text scrolls instead of growing the card.
// The bottom close pill sits under the idle frame too, so with it an open card also stops there.
const scrollCardHeight = computed(() => idleFrame.value.y + idleFrame.value.height - geometry.value.active.card.y);
const cardLimit = computed(() => scroll.value || bottomClose.value ? scrollCardHeight.value : maxCardHeight.value);
function onCardHeight(needed: number) {
  cardHeight.value = scroll.value
    ? scrollCardHeight.value
    : Math.min(cardLimit.value, Math.max(geometry.value.active.card.height, needed));
}
watch([idle, () => props.snapshot.subItem, () => props.offsetY, scroll, scrollCardHeight], () => {
  cardHeight.value = scroll.value ? scrollCardHeight.value : geometry.value.active.card.height;
}, { immediate: true });
const cardBottom = computed(() => geometry.value.active.card.y + cardHeight.value);
// The stacked layout's box grows to the lowest open element: the card, or the bottom close pill.
watch(() => bottomClose.value ? Math.max(cardBottom.value, closeRect.value.y + closeRect.value.height) : cardBottom.value, bottom => emit('cardBottom', bottom), { immediate: true });
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
    @pointerdown.capture="$emit('activity', column.id)" @wheel.capture.passive="$emit('activity', column.id)" @keydown.capture="$emit('activity', column.id)"
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
        v-if="idle" class="absolute" :style="rectStyle(idleFrame, geometry.section)"
        :column="column" :locale="snapshot.locale" :label="copy.label" :hint-key="hintKey" @action="act"
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
        <span v-else class="text-[length:calc(var(--fs-subitem,32)*var(--wall-u))] font-extrabold uppercase tracking-wide text-white drop-shadow-[0_0_calc(12*var(--wall-x))_rgba(102,204,255,0.9)]">
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
        :geometry="geometry.active" :show-arrows="settings.wall.showArrows" :show-pages="settings.wall.showPages || tabsAlways" :auto-page="autoPageActive(settings.wall)" :scroll="scroll" :text-min="cardText?.min" :text-max="cardText?.max" :max-height="cardLimit" @action="act" @height="onCardHeight"
        @media-ended="emit('slideEnded', column.id)"
      />
    </Transition>

    <Transition
      enter-active-class="transition duration-300 delay-300" enter-from-class="opacity-0 scale-75" enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0"
    >
      <WallHoldButton
        v-if="!idle && bottomClose" :outline="closeRect" group="back" :radius="18"
        class="wall-back wall-pill absolute z-20 flex items-center gap-[calc(10*var(--wall-x))] pl-[calc(6*var(--wall-x))] pr-[calc(16*var(--wall-x))] [border-radius:calc(18*var(--wall-x))/calc(18*var(--wall-y))] bg-linear-to-b from-[#112a9c]/95 via-[#0a1a78]/95 to-[#071056]/95 ring-2 ring-wall-glow/70 shadow-[0_0_calc(18*var(--wall-x))_rgba(80,190,255,0.5),inset_0_calc(2*var(--wall-y))_calc(10*var(--wall-y))_rgba(255,255,255,0.12)] text-white cursor-pointer"
        :style="rectStyle(closeRect, geometry.section)"
        :aria-label="WALL_COPY[snapshot.locale].back" data-sensor-action="back" data-close="bottom"
        @activate="act({ type: 'back', columnId: column.id })"
      >
        <!-- Same build as the title pill (WallColumnPill): a glowing red ring with ✕ and the label. -->
        <span class="shrink-0 ml-[calc(10*var(--wall-x))] w-[calc(64*var(--wall-x))] h-[calc(64*var(--wall-y))] flex items-center justify-center rounded-full ring-3 ring-wall-glow bg-red-600 text-[length:calc(30*var(--wall-u))] leading-none shadow-[0_0_calc(16*var(--wall-x))_rgba(102,204,255,0.8),inset_0_0_calc(12*var(--wall-x))_rgba(255,255,255,0.25)]" aria-hidden="true">✕</span>
        <span class="flex-1 min-w-0 text-left font-display text-[length:calc(var(--fs-title,27)*var(--wall-u))] [font-weight:var(--fw-title,700)] uppercase leading-[1.08] tracking-[0.01em] drop-shadow-[0_0_calc(6*var(--wall-x))_rgba(102,204,255,0.5)]">{{ WALL_COPY[snapshot.locale].close }}</span>
      </WallHoldButton>
      <WallHoldButton
        v-else-if="!idle && settings.wall.showClose" :outline="closeRect" group="back" :radius="22 * settings.wall.closeScale"
        class="wall-back absolute z-20 flex items-center justify-center rounded-full bg-[#0b1a78] ring-2 ring-[#bfe8ff] shadow-[0_0_calc(12*var(--wall-x))_rgba(102,204,255,0.8)] text-white hover:bg-red-500 cursor-pointer"
        :style="{ ...rectStyle(closeRect, geometry.section), fontSize: `calc(${20 * settings.wall.closeScale} * var(--wall-u))` }"
        :aria-label="WALL_COPY[snapshot.locale].back" data-sensor-action="back"
        @activate="act({ type: 'back', columnId: column.id })"
      >
        <span aria-hidden="true">✕</span>
      </WallHoldButton>
    </Transition>
  </section>
</template>
