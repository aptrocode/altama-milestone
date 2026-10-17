<script setup lang="ts">
import type { WallAction, WallLocale } from '../../../shared/wall';
import type { ColumnConfig } from '~/types/wall-content';
import { computed } from 'vue';
import WallHoldButton from '~/components/wall/WallHoldButton.vue';
import WallLanguageSwitcher from '~/components/wall/WallLanguageSwitcher.vue';
import { getColumnLayout, installationLayout, rectStyle } from '~/data/installation-layout';

/**
 * Idle frame (reference mockup 1): one full-frame hold target with artwork for single columns,
 * or one hold tile per sub-item for expandable columns, plus the floating flag bar.
 */
const props = defineProps<{ column: ColumnConfig; locale: WallLocale; label: string }>();
const emit = defineEmits<{ action: [action: WallAction] }>();

const geometry = computed(() => getColumnLayout(props.column.id));
const card = computed(() => geometry.value.card);
const artworkStyle = computed(() => rectStyle(installationLayout.visual.artwork, { x: 0, y: card.value.y }));
const tiles = computed(() => (geometry.value.subItems || []).map(tile => ({
  tile,
  sub: props.column.subItems!.find(sub => sub.key === tile.key)!,
})));
</script>

<template>
  <div
    class="wall-frame [border-radius:calc(14*var(--wall-x))/calc(14*var(--wall-y))] bg-[#0a1a80]/35 ring-2 ring-wall-glow/80 shadow-[0_0_calc(20*var(--wall-x))_rgba(80,190,255,0.6),inset_0_0_calc(24*var(--wall-x))_rgba(80,190,255,0.25)]"
  >
    <WallHoldButton
      v-if="geometry.main" class="absolute inset-0 [border-radius:inherit] hover:bg-white/5"
      :outline="geometry.main" :radius="14" :aria-label="label" data-sensor-action="main"
      @activate="emit('action', { type: 'main', columnId: column.id })"
    >
      <img
        v-if="column.illustration" :src="column.illustration.src" alt=""
        class="absolute object-contain pointer-events-none" :style="artworkStyle"
      >
    </WallHoldButton>
    <WallHoldButton
      v-for="{ tile, sub } in tiles" :key="tile.key"
      class="absolute overflow-hidden [border-radius:calc(10*var(--wall-x))/calc(10*var(--wall-y))] ring-1 ring-white/30 shadow-[0_0_calc(10*var(--wall-x))_rgba(80,190,255,0.35)]"
      :class="column.captionTiles ? 'bg-[#1530b8]/70' : ''"
      :style="rectStyle(tile, card)" :outline="tile" :radius="10" :aria-label="sub.i18n[locale].label"
      data-sensor-action="subItem" :data-sub-item="tile.key"
      @activate="emit('action', { type: 'subItem', columnId: column.id, subItemId: tile.key })"
    >
      <span v-if="column.captionTiles" class="absolute inset-x-0 top-[calc(8*var(--wall-y))] z-10 text-[length:calc(30*var(--wall-x))] font-extrabold uppercase tracking-wide text-white text-center leading-none drop-shadow-[0_0_calc(8*var(--wall-x))_rgba(0,0,60,0.8)]">
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
