<script setup lang="ts">
import type { Milestone } from '~/types/milestone';
import { nextTick, ref } from 'vue';

const props = defineProps<{
  milestone: Milestone;
  ready: boolean;
}>();

const emit = defineEmits<{
  activate: [];
}>();

const frame = ref<HTMLElement | null>(null);
const slots = ref<[Milestone | null, Milestone | null]>([props.milestone, null]);
const activeIndex = ref<0 | 1>(0);
let stagedIndex: 0 | 1 | null = null;

function nextFrame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()));
}

async function stage(milestone: Milestone) {
  const targetIndex = (activeIndex.value === 0 ? 1 : 0) as 0 | 1;
  stagedIndex = targetIndex;
  slots.value[targetIndex] = milestone;
  await nextTick();

  const container = frame.value?.querySelector<HTMLElement>(`[data-artwork-id="${milestone.id}"][data-slot="${targetIndex}"]`);
  if (!container)
    throw new Error(`Unable to stage artwork for ${milestone.id}`);

  const images = [...container.querySelectorAll('img')];
  await Promise.all(images.map(image => image.decode()));

  if (images.some(image => image.naturalWidth !== milestone.artwork.width || image.naturalHeight !== milestone.artwork.height))
    throw new Error(`Staged artwork dimensions do not match ${milestone.id}`);

  await nextFrame();
}

async function commit() {
  if (stagedIndex === null)
    throw new Error('No staged artwork to commit');

  const previousIndex = activeIndex.value;
  activeIndex.value = stagedIndex;
  stagedIndex = null;
  await nextTick();
  await nextFrame();
  await nextFrame();
  slots.value[previousIndex] = null;
}

defineExpose({ stage, commit });
</script>

<template>
  <button
    ref="frame"
    type="button"
    class="artwork-frame"
    :disabled="!ready"
    :aria-label="`Warnai ilustrasi ${milestone.year} — ${milestone.title}`"
    @click="emit('activate')"
  >
    <span
      v-for="(slot, index) in slots"
      v-show="slot"
      :key="index"
      class="artwork-slot"
      :data-active="index === activeIndex"
      :data-artwork-id="slot?.id"
      :data-slot="index"
      :style="{ opacity: index === activeIndex ? 1 : 0, zIndex: index === activeIndex ? 2 : 1 }"
    >
      <template v-if="slot">
        <img class="artwork-sketch" :src="slot.artwork.sketch" :width="slot.artwork.width" :height="slot.artwork.height" alt="" draggable="false">
        <img class="artwork-color" :src="slot.artwork.color" :width="slot.artwork.width" :height="slot.artwork.height" alt="" draggable="false">
      </template>
    </span>
    <span v-if="!ready" class="artwork-loading">Menyiapkan cerita…</span>
  </button>
</template>

<style scoped>
.artwork-frame { position: relative; display: block; height: 100%; width: 100%; padding: 0; border: 0; background: transparent; cursor: pointer; }
.artwork-frame:focus-visible { outline: 2px dashed var(--accent); outline-offset: -6px; }
.artwork-slot { position: absolute; inset: 0; mask-image: linear-gradient(to bottom, #000 83%, transparent 100%); }
.artwork-slot img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: fill; }
.artwork-sketch { filter: grayscale(1); opacity: 0.8; }
.artwork-color { clip-path: inset(100% 0 0 0); will-change: clip-path; }
.artwork-loading { position: absolute; inset: 0; z-index: 5; display: grid; place-items: center; background: #fffdf7e0; color: var(--accent-dark); font-size: 1cqw; }
</style>
