<script setup lang="ts">
import type { WallAction, WallLocale } from '../../../shared/wall';
import type { ColumnConfig } from '~/types/wall-content';
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import WallHoldButton from '~/components/wall/WallHoldButton.vue';
import WallLanguageSwitcher from '~/components/wall/WallLanguageSwitcher.vue';
import { getColumnLayout, rectStyle } from '~/data/installation-layout';
import { useSettingsStore } from '~/stores/settings';
import { isVideoSrc } from '~/utils/media';
import { extendDown, languageGeometry } from '../../../shared/language-bar';

/**
 * Idle frame (reference mockup 1): one full-frame hold target with artwork for single columns,
 * or one hold tile per sub-item for expandable columns, plus the floating flag bar.
 */
const props = defineProps<{ column: ColumnConfig; locale: WallLocale; label: string; /** Idle hint target: `main` or a tile key. */ hintKey?: string | null }>();
const emit = defineEmits<{ action: [action: WallAction] }>();

const settings = useSettingsStore();
const geometry = computed(() => getColumnLayout(props.column.id));
// Compact pill or full-width bar (dashboard), the same rects Sensor Service uses.
const language = computed(() => languageGeometry(geometry.value, settings.wall.languageBar));
const card = computed(() => geometry.value.card);
const main = computed(() => geometry.value.main && extendDown(geometry.value.main, language.value.extend));
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

// The 2 + 1 language grid makes the frame taller. Card artwork videos carry the frame border, so
// instead of stretching them (which would distort the artwork and misalign the tiles), a canvas
// redraws each frame in three slices: the top at its size, one pixel row through the plain panel
// behind the language bar stretched over the extra height, and the bottom edge moved down.
const ARTWORK_BLEED = 9;
const stretchArtwork = computed(() => cardVideo.value && language.value.extend > 0);
const canvasElement = ref<HTMLCanvasElement | null>(null);
let drawing = false;

function drawArtwork() {
  const video = videoElement.value;
  const canvas = canvasElement.value;
  const context = canvas?.getContext('2d');
  if (!video || !canvas || !context || !video.videoWidth)
    return;
  const width = video.videoWidth;
  const height = video.videoHeight;
  const scale = height / (card.value.height + ARTWORK_BLEED * 2);
  const bar = geometry.value.languageBar;
  const split = Math.round((bar.y + bar.height / 2 - card.value.y + ARTWORK_BLEED) * scale);
  const gap = Math.round(language.value.extend * scale);
  if (canvas.width !== width || canvas.height !== height + gap) {
    canvas.width = width;
    canvas.height = height + gap;
  }
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(video, 0, 0, width, split, 0, 0, width, split);
  context.drawImage(video, 0, split, width, 1, 0, split, width, gap);
  context.drawImage(video, 0, split, width, height - split, 0, split + gap, width, height - split);
}

// requestAnimationFrame, not requestVideoFrameCallback: Chrome does not present frames of the
// transparent (opacity-0) source video, so its frame callbacks never fire. Redraw only when the
// video moved on.
let drawnTime = -1;
function nextArtworkFrame() {
  const video = videoElement.value;
  if (!drawing || !video)
    return;
  if (video.currentTime !== drawnTime) {
    drawnTime = video.currentTime;
    drawArtwork();
  }
  requestAnimationFrame(nextArtworkFrame);
}

watch([stretchArtwork, videoElement, canvasElement], ([stretch, video, canvas]) => {
  const start = !!(stretch && video && canvas);
  if (start && !drawing) {
    drawing = true;
    video!.addEventListener('loadeddata', drawArtwork);
    nextArtworkFrame();
  }
  drawing = start;
}, { flush: 'post' });

// Vue runs unmount hooks when the frame's leave transition starts (WallColumn keeps the element
// for its 200 ms fade). Releasing the video then would blank the card artwork at once while the
// flags and captions still fade, so release it only after the fade has finished.
const RELEASE_AFTER_LEAVE_MS = 400;
onBeforeUnmount(() => {
  drawing = false;
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
        class="size-full object-fill" :class="stretchArtwork ? 'opacity-0' : ''"
      />
      <canvas v-if="stretchArtwork" ref="canvasElement" class="absolute inset-0 size-full" />
      <!-- Still images only; video artwork is drawn by the video (or the grid canvas above). -->
      <img v-if="!cardVideo" :src="column.illustration.src" alt="" class="size-full object-fill">
    </div>
    <WallHoldButton
      v-if="main" class="absolute inset-0 [border-radius:inherit] hover:bg-white/5"
      :outline="main" group="card" :radius="14" :hint="hintKey === 'main'" :aria-label="label" data-sensor-action="main"
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
      :outline="tile" group="card" :radius="column.illustration ? 19 : 10" :hint="hintKey === tile.key" :aria-label="sub.i18n[locale].label"
      data-sensor-action="subItem" :data-sub-item="tile.key"
      @activate="emit('action', { type: 'subItem', columnId: column.id, subItemId: tile.key })"
    >
      <span v-if="column.captionTiles" class="absolute inset-x-0 top-[calc(8*var(--wall-y))] z-10 text-[length:calc(var(--fs-caption,30)*var(--wall-u))] font-extrabold uppercase tracking-wide text-white text-center leading-none drop-shadow-[0_0_calc(8*var(--wall-x))_rgba(0,0,60,0.8)]">
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
      class="absolute z-20" :style="rectStyle(language.languageBar, card)"
      :column-id="column.id" :locale="locale" :bar="language.languageBar" :targets="language.languages"
      @select="emit('action', { type: 'language', columnId: column.id, locale: $event })"
    />
  </div>
</template>
