<script setup lang="ts">
import type { WallAction, WallLocale } from '../../../shared/wall';
import type { ColumnConfig } from '~/types/wall-content';
import { computed, onBeforeUnmount, ref } from 'vue';
import WallHoldButton from '~/components/wall/WallHoldButton.vue';
import WallLanguageSwitcher from '~/components/wall/WallLanguageSwitcher.vue';
import { getColumnLayout, rectStyle } from '~/data/installation-layout';

/**
 * Idle frame (reference mockup 1): one full-frame hold target with artwork for single columns,
 * or one hold tile per sub-item for expandable columns, plus the floating flag bar.
 */
const props = defineProps<{ column: ColumnConfig; locale: WallLocale; label: string }>();
const emit = defineEmits<{ action: [action: WallAction] }>();

const geometry = computed(() => getColumnLayout(props.column.id));
const card = computed(() => geometry.value.card);
const tiles = computed(() => (geometry.value.subItems || []).map(tile => ({
  tile,
  sub: props.column.subItems!.find(sub => sub.key === tile.key)!,
})));

// Columns 2/5 have no card video, so their frame redraws the video's neon border, measured from
// public/new-assets/card-button: 19 px corners, blue halo to -5.5, white core on the edge, and a
// bright blue band fading into the navy fill by +12 (logical px from the frame edge).
const NEON_FRAME = [
  '[border-radius:calc(19*var(--wall-x))/calc(19*var(--wall-y))] bg-linear-to-b from-[#011c80] via-[#00176c] to-[#00144c]',
  'shadow-[0_0_0_calc(0.6*var(--wall-x))_#f2f8ff,0_0_calc(1.5*var(--wall-x))_calc(2*var(--wall-x))_#1a8cff,0_0_calc(1*var(--wall-x))_calc(5.5*var(--wall-x))_#0044f2,0_0_calc(6*var(--wall-x))_calc(5*var(--wall-x))_rgba(0,60,255,0.35),inset_0_0_0_calc(1.2*var(--wall-x))_#eef6ff,inset_0_0_calc(1.5*var(--wall-x))_calc(2.6*var(--wall-x))_#3aa0ff,inset_0_0_calc(2*var(--wall-x))_calc(9.5*var(--wall-x))_#0436ff,inset_0_0_calc(8*var(--wall-x))_calc(11*var(--wall-x))_rgba(0,40,230,0.55)]',
].join(' ');

const videoElement = ref<HTMLVideoElement | null>(null);

onBeforeUnmount(() => {
  const element = videoElement.value;
  if (!element)
    return;
  element.pause();
  element.removeAttribute('src');
  element.load();
});
</script>

<template>
  <div
    class="wall-frame"
    :class="geometry.main
      ? '[border-radius:calc(14*var(--wall-x))/calc(14*var(--wall-y))]'
      : NEON_FRAME"
  >
    <WallHoldButton
      v-if="geometry.main" class="absolute inset-0 [border-radius:inherit] hover:bg-white/5"
      :outline="geometry.main" group="card" :radius="14" :aria-label="label" data-sensor-action="main"
      @activate="emit('action', { type: 'main', columnId: column.id })"
    >
      <div class="pointer-events-none absolute -inset-[calc(9*var(--wall-x))]">
        <video
          v-if="column.illustration?.src.endsWith('.webm') || column.illustration?.src.endsWith('.mp4')"
          ref="videoElement" :src="column.illustration.src"
          autoplay loop muted playsinline preload="auto" disablepictureinpicture
          class="size-full object-fill"
        />
        <img
          v-else-if="column.illustration" :src="column.illustration.src" alt=""
          class="size-full object-fill"
        >
      </div>
    </WallHoldButton>
    <WallHoldButton
      v-for="{ tile, sub } in tiles" :key="tile.key"
      class="absolute overflow-hidden [border-radius:calc(10*var(--wall-x))/calc(10*var(--wall-y))] ring-1 ring-white/30 shadow-[0_0_calc(10*var(--wall-x))_rgba(80,190,255,0.35)]"
      :class="column.captionTiles ? 'bg-[#1530b8]/70' : ''"
      :style="rectStyle(tile, card)" :outline="tile" group="card" :radius="10" :aria-label="sub.i18n[locale].label"
      data-sensor-action="subItem" :data-sub-item="tile.key"
      @activate="emit('action', { type: 'subItem', columnId: column.id, subItemId: tile.key })"
    >
      <span v-if="column.captionTiles" class="absolute inset-x-0 top-[calc(8*var(--wall-y))] z-10 text-[length:calc(30*var(--wall-u))] font-extrabold uppercase tracking-wide text-white text-center leading-none drop-shadow-[0_0_calc(8*var(--wall-x))_rgba(0,0,60,0.8)]">
        {{ sub.i18n[locale].label }}
      </span>
      <img
        :src="sub.image.src" alt="" class="absolute inset-x-0 bottom-0 w-full object-cover pointer-events-none"
        :class="column.captionTiles ? 'h-[78%]' : 'h-full'"
      >
    </WallHoldButton>
    <WallLanguageSwitcher
      class="absolute z-20" :style="rectStyle(geometry.languageBar, card)"
      :column-id="column.id" :locale="locale" :bar="geometry.languageBar" :targets="geometry.languages"
      @select="emit('action', { type: 'language', columnId: column.id, locale: $event })"
    />
  </div>
</template>
