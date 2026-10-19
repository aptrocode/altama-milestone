<script setup lang="ts">
import type { WallAction, WallLocale } from '../../../shared/wall';
import type { ColumnConfig } from '~/types/wall-content';
import { computed, onBeforeUnmount, ref } from 'vue';
import WallHoldButton from '~/components/wall/WallHoldButton.vue';
import WallLanguageSwitcher from '~/components/wall/WallLanguageSwitcher.vue';
import { getColumnLayout, rectStyle } from '~/data/installation-layout';
import { isVideoSrc } from '~/utils/media';

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

// Columns without card artwork (Our Brand) redraw the card videos' neon border, measured from
// public/new-assets/card-button: 19 px corners, blue halo to -5.5, white core on the edge, and a
// bright blue band fading into the navy fill by +12 (logical px from the frame edge).
const NEON_FRAME = [
  '[border-radius:calc(19*var(--wall-x))/calc(19*var(--wall-y))] bg-linear-to-b from-[#011c80] via-[#00176c] to-[#00144c]',
  'shadow-[0_0_0_calc(0.6*var(--wall-x))_#f2f8ff,0_0_calc(1.5*var(--wall-x))_calc(2*var(--wall-x))_#1a8cff,0_0_calc(1*var(--wall-x))_calc(5.5*var(--wall-x))_#0044f2,0_0_calc(6*var(--wall-x))_calc(5*var(--wall-x))_rgba(0,60,255,0.35),inset_0_0_0_calc(1.2*var(--wall-x))_#eef6ff,inset_0_0_calc(1.5*var(--wall-x))_calc(2.6*var(--wall-x))_#3aa0ff,inset_0_0_calc(2*var(--wall-x))_calc(9.5*var(--wall-x))_#0436ff,inset_0_0_calc(8*var(--wall-x))_calc(11*var(--wall-x))_rgba(0,40,230,0.55)]',
].join(' ');

const cardVideo = computed(() => isVideoSrc(props.column.illustration?.src));
const videoElement = ref<HTMLVideoElement | null>(null);

// Vue runs unmount hooks when the frame's leave transition starts (WallColumn keeps the element
// for its 200 ms fade). Releasing the video then would blank the card artwork at once while the
// flags and captions still fade, so release it only after the fade has finished.
const RELEASE_AFTER_LEAVE_MS = 400;
onBeforeUnmount(() => {
  const element = videoElement.value;
  if (!element)
    return;
  setTimeout(() => {
    element.pause();
    element.removeAttribute('src');
    element.load();
  }, RELEASE_AFTER_LEAVE_MS);
});
</script>

<template>
  <div
    class="wall-frame"
    :class="column.illustration
      ? '[border-radius:calc(14*var(--wall-x))/calc(14*var(--wall-y))]'
      : NEON_FRAME"
  >
    <!-- Card artwork (usually a transparent video with the frame, glow, and tile panels baked in).
         It spans 9 logical px beyond the frame on every side, like the source renders. -->
    <div v-if="column.illustration" class="pointer-events-none absolute -inset-[calc(9*var(--wall-x))]">
      <video
        v-if="cardVideo"
        ref="videoElement" :src="column.illustration.src"
        autoplay loop muted playsinline preload="auto" disablepictureinpicture
        class="size-full object-fill"
      />
      <img v-else :src="column.illustration.src" alt="" class="size-full object-fill">
    </div>
    <WallHoldButton
      v-if="geometry.main" class="absolute inset-0 [border-radius:inherit] hover:bg-white/5"
      :outline="geometry.main" group="card" :radius="14" :aria-label="label" data-sensor-action="main"
      @activate="emit('action', { type: 'main', columnId: column.id })"
    />
    <!-- Over card artwork the tiles are transparent targets on its panels (19 px corners);
         otherwise each tile draws its own image. -->
    <WallHoldButton
      v-for="{ tile, sub } in tiles" :key="tile.key"
      class="absolute overflow-hidden"
      :class="column.illustration
        ? '[border-radius:calc(19*var(--wall-x))/calc(19*var(--wall-y))] hover:bg-white/5'
        : ['[border-radius:calc(10*var(--wall-x))/calc(10*var(--wall-y))] ring-1 ring-white/30 shadow-[0_0_calc(10*var(--wall-x))_rgba(80,190,255,0.35)]', column.captionTiles ? 'bg-[#1530b8]/70' : '']"
      :style="{ ...rectStyle(tile, card), backgroundColor: column.illustration ? undefined : sub.tileBackground }"
      :outline="tile" group="card" :radius="column.illustration ? 19 : 10" :aria-label="sub.i18n[locale].label"
      data-sensor-action="subItem" :data-sub-item="tile.key"
      @activate="emit('action', { type: 'subItem', columnId: column.id, subItemId: tile.key })"
    >
      <span v-if="column.captionTiles" class="absolute inset-x-0 top-[calc(8*var(--wall-y))] z-10 text-[length:calc(30*var(--wall-u))] font-extrabold uppercase tracking-wide text-white text-center leading-none drop-shadow-[0_0_calc(8*var(--wall-x))_rgba(0,0,60,0.8)]">
        {{ sub.i18n[locale].label }}
      </span>
      <img
        v-if="!column.illustration && sub.tileBackground" :src="sub.image.src" alt=""
        class="absolute left-[calc(18*var(--wall-x))] top-[calc(22*var(--wall-y))] w-[calc(100%-36*var(--wall-x))] h-[calc(100%-44*var(--wall-y))] object-contain pointer-events-none"
      >
      <img
        v-else-if="!column.illustration" :src="sub.image.src" alt="" class="absolute inset-x-0 bottom-0 w-full object-cover pointer-events-none"
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
