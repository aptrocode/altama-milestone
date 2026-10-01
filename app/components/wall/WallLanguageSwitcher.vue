<script setup lang="ts">
import type { ColumnId, WallLocale } from '../../../shared/wall';
import { FLAG_SOURCES, WALL_COPY } from '~/data/wall-copy';
import { WALL_LOCALES } from '../../../shared/wall';

defineProps<{ columnId: ColumnId; locale: WallLocale }>();
defineEmits<{ select: [locale: WallLocale] }>();
</script>

<template>
  <div
    class="wall-language-bar bg-neutral-900/90 rounded-full shadow-sm self-center shrink-0"
    role="group" :aria-label="WALL_COPY[locale].language"
  >
    <button
      v-for="option in WALL_LOCALES" :key="option" type="button"
      class="wall-flag rounded-md border-2 cursor-pointer transition-colors duration-150"
      :class="locale === option ? 'border-emerald-400 bg-emerald-700/80 shadow-[0_0_10px_rgba(16,185,129,0.6)]' : 'border-transparent hover:border-white/50'"
      :aria-label="WALL_COPY[locale].languages[option]" :title="WALL_COPY[locale].languages[option]"
      :aria-pressed="locale === option" :data-col="columnId" data-sensor-action="language"
      :data-locale="option" @click="$emit('select', option)"
    >
      <img :src="FLAG_SOURCES[option]" alt="" class="wall-flag-image rounded-xs pointer-events-none">
    </button>
  </div>
</template>
