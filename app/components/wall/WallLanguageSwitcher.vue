<script setup lang="ts">
import type { ColumnId, WallLocale } from '../../../shared/wall';
import { FLAG_SOURCES, WALL_COPY } from '~/data/wall-copy';
import { WALL_LOCALES } from '../../../shared/wall';

defineProps<{ columnId: ColumnId; locale: WallLocale }>();
defineEmits<{ select: [locale: WallLocale] }>();
</script>

<template>
  <fieldset
    class="wall-language-bar min-w-0 w-max flex px-(--wall-language-padding-inline-x) py-(--wall-language-padding-block-y) gap-(--wall-language-gap-x) bg-[#172b24] rounded-full shadow-lg"
    role="group" :aria-label="WALL_COPY[locale].language"
  >
    <button
      v-for="option in WALL_LOCALES" :key="option" type="button"
      class="wall-flag w-(--wall-flag-width-x) h-(--wall-flag-height-y) flex items-center justify-center shrink-0 rounded-[calc(9*var(--wall-x))] border-2 cursor-pointer transition-colors duration-150"
      :class="locale === option ? 'border-emerald-400 bg-emerald-700/80 shadow-[0_0_10px_rgba(16,185,129,0.6)]' : 'border-transparent hover:border-white/50'"
      :aria-label="WALL_COPY[locale].languages[option]" :title="WALL_COPY[locale].languages[option]"
      :aria-pressed="locale === option" :data-col="columnId" data-sensor-action="language"
      :data-locale="option" @click="$emit('select', option)"
    >
      <img :src="FLAG_SOURCES[option]" alt="" class="w-[calc(40*var(--wall-x))] h-[calc(26*var(--wall-y))] object-contain rounded-xs pointer-events-none">
    </button>
  </fieldset>
</template>
