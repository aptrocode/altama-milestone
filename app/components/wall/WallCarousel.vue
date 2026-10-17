<script setup lang="ts">
import type { ColumnId, WallAction, WallLocale } from '../../../shared/wall';
import type { Rect } from '~/data/installation-layout';
import type { ColumnContent } from '~/data/wall-config';
import { computed } from 'vue';
import WallSlideContent from '~/components/wall/WallSlideContent.vue';
import { installationLayout, rectStyle } from '~/data/installation-layout';
import { WALL_COPY } from '~/data/wall-copy';

const props = defineProps<{
  columnId: ColumnId;
  content: ColumnContent;
  locale: WallLocale;
  photo: number;
  page: number;
  geometry: { card: Rect; previous: Rect; next: Rect; pages: (Rect & { page: number })[] };
}>();
defineEmits<{ action: [action: WallAction] }>();

const visual = installationLayout.visual;
const hasPhotos = computed(() => props.content.photos.length > 0);
const hasSlider = computed(() => props.content.photos.length > 1);
const hasPages = computed(() => props.content.pages.length > 1);
// Text starts below whichever of the photo frame and page tabs are present.
const textTop = computed(() => hasPages.value ? visual.textTop.tabs : hasPhotos.value ? visual.textTop.photo : visual.textTop.plain);
const textStyle = computed(() => ({
  top: `calc(${textTop.value} * var(--wall-y))`,
  bottom: `calc(20 * var(--wall-y))`,
  left: `calc(26 * var(--wall-x))`,
  right: `calc(24 * var(--wall-x))`,
}));
// The long Summit story uses a slightly smaller body size to fit the card.
const dense = computed(() => props.content.pages.some(item => JSON.stringify(item.i18n[props.locale].blocks).length > 520));
</script>

<template>
  <div
    class="wall-active overflow-hidden [border-radius:calc(46*var(--wall-x))/calc(46*var(--wall-y))] bg-[#040c55]/92 ring-3 ring-[#bfe8ff] shadow-[0_0_calc(24*var(--wall-x))_rgba(90,190,255,0.75),inset_0_0_calc(22*var(--wall-x))_rgba(90,190,255,0.35)]"
  >
    <div
      v-if="hasPhotos" class="absolute overflow-hidden [border-radius:calc(12*var(--wall-x))/calc(12*var(--wall-y))] bg-[#0b1a78]"
      :style="rectStyle(visual.photo)"
    >
      <div
        v-for="(item, index) in content.photos" :key="index"
        class="absolute inset-0 transition-opacity duration-300 motion-reduce:transition-none"
        :class="photo === index ? 'opacity-100' : 'opacity-0'" :aria-hidden="photo !== index" :data-photo="index + 1"
      >
        <img v-if="item" :src="item.src" alt="" class="size-full object-cover">
        <div v-else class="size-full flex flex-col items-center justify-center gap-[calc(8*var(--wall-y))] border border-dashed border-white/25 [border-radius:inherit]">
          <svg viewBox="0 0 100 80" class="w-[calc(44*var(--wall-x))] h-[calc(35*var(--wall-y))] text-white/40" aria-hidden="true">
            <polygon points="50,15 85,65 15,65" fill="currentColor" />
          </svg>
          <span class="font-display text-[length:calc(16*var(--wall-x))] uppercase tracking-wide text-white/60">{{ WALL_COPY[locale].photo }} {{ String(index + 1).padStart(2, '0') }}</span>
        </div>
      </div>
    </div>

    <template v-if="hasSlider">
      <button
        v-for="direction in ['previous', 'next'] as const" :key="direction" type="button"
        class="wall-carousel-arrow absolute z-10 flex items-center justify-center cursor-pointer"
        :style="rectStyle(geometry[direction], geometry.card)"
        :aria-label="WALL_COPY[locale][direction]" :data-sensor-action="direction"
        @click="$emit('action', { type: direction, columnId })"
      >
        <span class="w-[calc(34*var(--wall-x))] h-[calc(34*var(--wall-y))] flex items-center justify-center rounded-full bg-white text-[#0b1a78] shadow-[0_calc(2*var(--wall-y))_calc(8*var(--wall-y))_rgba(0,0,30,0.45)]">
          <svg
            class="w-[calc(20*var(--wall-x))] h-[calc(20*var(--wall-y))]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
          >
            <polyline :points="direction === 'previous' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'" />
          </svg>
        </span>
      </button>
    </template>

    <template v-if="hasPages">
      <button
        v-for="target in geometry.pages.slice(0, content.pages.length)" :key="target.page" type="button"
        class="wall-page-tab absolute flex items-center justify-center [border-radius:calc(7*var(--wall-x))/calc(7*var(--wall-y))] font-display text-[length:calc(24*var(--wall-x))] font-bold uppercase tracking-wide cursor-pointer transition-colors duration-200"
        :class="page === target.page ? 'bg-[#0b1a78] text-white ring-2 ring-[#9fdcff] shadow-[0_0_calc(12*var(--wall-x))_rgba(102,204,255,0.8)]' : 'bg-white text-[#0b1a78] ring-2 ring-white/80 hover:bg-sky-100'"
        :style="rectStyle(target, geometry.card)"
        :aria-pressed="page === target.page" data-sensor-action="page" :data-page="target.page"
        @click="$emit('action', { type: 'page', columnId, page: target.page })"
      >
        {{ content.pages[target.page]!.i18n[locale].tab || String(target.page + 1) }}
      </button>
    </template>

    <div class="absolute" :style="textStyle">
      <WallSlideContent
        v-for="(item, index) in content.pages" :key="index"
        class="absolute inset-0 overflow-hidden text-white font-bold leading-[1.18] transition-opacity duration-300 motion-reduce:transition-none"
        :class="[page === index ? 'opacity-100' : 'opacity-0', dense ? 'text-[length:calc(14*var(--wall-x))]' : 'text-[length:calc(14.5*var(--wall-x))]']"
        :aria-hidden="page !== index" :copy="item.i18n[locale]" :locale="locale"
      />
    </div>
  </div>
</template>
