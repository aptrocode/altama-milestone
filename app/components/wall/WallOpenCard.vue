<script setup lang="ts">
import type { ColumnId, WallAction, WallLocale } from '../../../shared/wall';
import type { Rect } from '~/data/installation-layout';
import type { ContentPage } from '~/types/wall-content';
import { computed, reactive, ref, watch } from 'vue';
import WallHoldButton from '~/components/wall/WallHoldButton.vue';
import WallPageCopy from '~/components/wall/WallPageCopy.vue';
import { installationLayout, rectStyle } from '~/data/installation-layout';
import { WALL_COPY } from '~/data/wall-copy';

/**
 * Open-card content: each page owns a photo slider and text. Arrows move photos inside the
 * current page; page tabs switch the whole page. Both are one-second hold targets.
 */
const props = defineProps<{
  columnId: ColumnId;
  pages: ContentPage[];
  locale: WallLocale;
  photo: number;
  page: number;
  geometry: { card: Rect; previous: Rect; next: Rect; pages: (Rect & { page: number })[] };
}>();
const emit = defineEmits<{ action: [action: WallAction]; height: [logical: number] }>();

const visual = installationLayout.visual;
const current = computed(() => props.pages[props.page] || props.pages[0]);
// Keep the frame for every page of the card so tabs and text never jump between pages.
const hasPhotoFrame = computed(() => props.pages.some(item => item.photos.length > 0));
const hasSlider = computed(() => (current.value?.photos.length || 0) > 1);
const hasPages = computed(() => props.pages.length > 1);
const tabs = computed(() => props.geometry.pages.slice(0, props.pages.length));
// Text starts below whichever of the photo frame and page tabs are present.
const textTop = computed(() => hasPages.value ? visual.textTop.tabs : hasPhotoFrame.value ? visual.textTop.photo : visual.textTop.plain);
const TEXT_BOTTOM = 20;
const textStyle = computed(() => ({
  top: `calc(${textTop.value} * var(--wall-y))`,
  bottom: `calc(${TEXT_BOTTOM} * var(--wall-y))`,
  left: `calc(26 * var(--wall-x))`,
  right: `calc(24 * var(--wall-x))`,
}));

// The card is as tall as the visible page needs (WallColumn clamps it between the layout's card
// height and visual.openCardMaxBottom), so a short page never carries the empty space of a long
// one; photos and tabs sit above the text, so only the bottom edge moves (animated) on a page
// switch. A probe of 1000 logical px converts measured CSS px without being affected by the
// height transition.
const probe = ref<HTMLElement | null>(null);
const naturals = reactive<Record<number, number>>({});
function reportHeight() {
  const pxPerUnit = (probe.value?.offsetHeight || 0) / 1000;
  const visible = naturals[props.page] || 0;
  if (pxPerUnit > 0 && visible > 0)
    emit('height', Math.ceil(textTop.value + visible / pxPerUnit + TEXT_BOTTOM));
}
watch([naturals, textTop, () => props.pages, () => props.page], reportHeight);
function onNatural(index: number, px: number) {
  naturals[index] = px;
}
function isVideo(src?: string) {
  return src ? /\.(?:mp4|webm|ogg)$/i.test(src) : false;
}
</script>

<template>
  <div
    class="wall-active overflow-hidden [border-radius:calc(46*var(--wall-x))/calc(46*var(--wall-y))] bg-[#040c55]/92 ring-3 ring-[#bfe8ff] shadow-[0_0_calc(24*var(--wall-x))_rgba(90,190,255,0.75),inset_0_0_calc(22*var(--wall-x))_rgba(90,190,255,0.35)]"
  >
    <div
      v-if="hasPhotoFrame" class="absolute overflow-hidden [border-radius:calc(12*var(--wall-x))/calc(12*var(--wall-y))] bg-[#0b1a78]"
      :style="rectStyle(visual.photo)"
    >
      <div
        v-for="(item, index) in current?.photos || []" :key="`${page}-${index}`"
        class="absolute inset-0 transition-opacity duration-300 motion-reduce:transition-none"
        :class="photo === index ? 'opacity-100' : 'opacity-0'" :aria-hidden="photo !== index" :data-photo="index + 1"
      >
        <video
          v-if="item && isVideo(item.src)"
          :src="item.src"
          autoplay
          loop
          muted
          playsinline
          class="size-full object-cover pointer-events-none"
        />
        <img v-else-if="item" :src="item.src" alt="" class="size-full object-cover">
        <div v-else class="size-full flex flex-col items-center justify-center gap-[calc(8*var(--wall-y))] border border-dashed border-white/25 [border-radius:inherit]">
          <svg viewBox="0 0 100 80" class="w-[calc(44*var(--wall-x))] h-[calc(35*var(--wall-y))] text-white/40" aria-hidden="true">
            <polygon points="50,15 85,65 15,65" fill="currentColor" />
          </svg>
          <span class="font-display text-[length:calc(16*var(--wall-u))] uppercase tracking-wide text-white/60">{{ WALL_COPY[locale].photo }} {{ String(index + 1).padStart(2, '0') }}</span>
        </div>
      </div>
    </div>

    <template v-if="hasSlider">
      <WallHoldButton
        v-for="direction in ['previous', 'next'] as const" :key="direction"
        class="wall-photo-arrow absolute z-10 flex items-center justify-center rounded-full"
        :style="rectStyle(geometry[direction], geometry.card)" :outline="geometry[direction]" group="slider" :radius="22"
        :aria-label="WALL_COPY[locale][direction]" :data-sensor-action="direction"
        @activate="$emit('action', { type: direction, columnId })"
      >
        <!-- The white disc nudges in its direction on a loop (translate only); the 44 px hit area
             and the hold outline stay put. -->
        <span
          class="relative w-[calc(34*var(--wall-x))] h-[calc(34*var(--wall-y))] flex items-center justify-center rounded-full bg-white text-[#0b1a78] shadow-[0_calc(2*var(--wall-y))_calc(8*var(--wall-y))_rgba(0,0,30,0.45)] pointer-events-none"
          :class="direction === 'previous' ? 'arrow-nudge-previous' : 'arrow-nudge-next'"
        >
          <svg
            class="w-[calc(20*var(--wall-x))] h-[calc(20*var(--wall-y))]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
          >
            <polyline :points="direction === 'previous' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'" />
          </svg>
        </span>
      </WallHoldButton>
    </template>

    <template v-if="hasPages">
      <WallHoldButton
        v-for="target in tabs" :key="target.page"
        class="wall-page-tab absolute flex items-center justify-center [border-radius:calc(7*var(--wall-x))/calc(7*var(--wall-y))] font-display text-[length:calc(24*var(--wall-u))] font-bold uppercase tracking-wide"
        :class="page === target.page ? 'pointer-events-none !cursor-default bg-[#0b1a78] text-white ring-2 ring-[#9fdcff] shadow-[0_0_calc(12*var(--wall-x))_rgba(102,204,255,0.8)]' : 'bg-white text-[#0b1a78] ring-2 ring-white/80 hover:bg-sky-100'"
        :style="rectStyle(target, geometry.card)" :outline="target" group="page" :radius="7"
        :disabled="page === target.page" :aria-current="page === target.page ? 'page' : undefined" data-sensor-action="page" :data-page="target.page"
        @activate="$emit('action', { type: 'page', columnId, page: target.page })"
      >
        <span class="relative pointer-events-none">{{ pages[target.page]!.i18n[locale].tab || String(target.page + 1) }}</span>
      </WallHoldButton>
    </template>

    <div class="absolute" :style="textStyle">
      <WallPageCopy
        v-for="(item, index) in pages" :key="index"
        class="absolute inset-0 overflow-hidden text-white transition-opacity duration-300 motion-reduce:transition-none"
        :class="page === index ? 'opacity-100' : 'opacity-0'"
        :aria-hidden="page !== index" :copy="item.i18n[locale]" :locale="locale" :active="page === index"
        @natural="onNatural(index, $event)"
      />
    </div>
    <span ref="probe" class="pointer-events-none invisible absolute top-0 left-0 w-0 h-[calc(1000*var(--wall-y))]" aria-hidden="true" />
  </div>
</template>

<style scoped>
/* Slider arrows nudge in their direction on a loop; Vue scopes these keyframes. Off under reduced motion. */
@media (prefers-reduced-motion: no-preference) {
  .arrow-nudge-previous {
    animation: arrow-nudge-previous 1.6s ease-in-out infinite;
  }
  .arrow-nudge-next {
    animation: arrow-nudge-next 1.6s ease-in-out infinite;
  }
}

@keyframes arrow-nudge-previous {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(calc(-5 * var(--wall-x, 1px))); }
}

@keyframes arrow-nudge-next {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(calc(5 * var(--wall-x, 1px))); }
}
</style>
