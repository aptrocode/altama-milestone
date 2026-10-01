<script setup lang="ts">
import type { WallAction, WallLocale } from '../../../shared/wall';
import type { ColumnConfig } from '~/data/wall-config';
import { WALL_COPY } from '~/data/wall-copy';

defineProps<{ column: ColumnConfig; locale: WallLocale; slide: number; label: string }>();
defineEmits<{ action: [action: WallAction] }>();
</script>

<template>
  <div class="wall-active absolute inset-0 rounded-[inherit] overflow-hidden">
    <div class="wall-active-heading relative z-10 h-(--wall-heading-height-y) flex items-center justify-center px-[calc(52*var(--wall-x))] bg-emerald-900/70">
      <span class="text-center text-[length:calc(18*var(--wall-x))] font-black text-emerald-100 uppercase tracking-wide leading-tight wrap-break-word">{{ label }}</span>
      <button
        type="button" class="wall-back absolute top-(--wall-back-padding-y) right-(--wall-back-padding-x) w-(--wall-control-size-x) h-(--wall-control-size-y) flex items-center justify-center rounded-full bg-white/20 text-white text-[length:calc(20*var(--wall-x))] hover:bg-red-500 cursor-pointer"
        :aria-label="WALL_COPY[locale].back" data-sensor-action="back"
        @click="$emit('action', { type: 'back', columnId: column.id })"
      >
        <span aria-hidden="true">✕</span>
      </button>
    </div>
    <div class="absolute top-(--wall-heading-height-y) bottom-[calc(64*var(--wall-y))] inset-x-[calc(12*var(--wall-x))] overflow-hidden [border-radius:calc(12*var(--wall-x))/calc(12*var(--wall-y))] bg-black/15 border border-dashed border-white/15">
      <div
        v-for="index in column.slides" :key="index"
        class="absolute inset-0 flex flex-col items-center justify-center gap-[calc(16*var(--wall-y))] transition-opacity duration-300 motion-reduce:transition-none"
        :class="slide === index - 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'"
        :aria-hidden="slide !== index - 1" :data-slide="index"
      >
        <svg viewBox="0 0 100 80" class="w-[calc(56*var(--wall-x))] h-[calc(44*var(--wall-y))] text-white/50" aria-hidden="true">
          <polygon points="50,15 85,65 15,65" fill="currentColor" />
        </svg>
        <span class="text-[length:calc(18*var(--wall-x))] uppercase tracking-wide font-bold text-white/65">{{ WALL_COPY[locale].photo }} {{ String(index).padStart(2, '0') }}</span>
      </div>
    </div>
    <button
      v-for="direction in ['previous', 'next'] as const" :key="direction" type="button"
      class="wall-carousel-arrow absolute z-10 top-1/2 -translate-y-1/2 w-(--wall-control-size-x) h-(--wall-control-size-y) flex items-center justify-center bg-emerald-200/20 hover:bg-emerald-200/35 border border-white/40 rounded-full text-white cursor-pointer shadow-sm"
      :class="direction === 'previous' ? 'left-(--wall-arrow-inset-x)' : 'right-(--wall-arrow-inset-x)'"
      :aria-label="WALL_COPY[locale][direction]" :data-sensor-action="direction"
      @click="$emit('action', { type: direction, columnId: column.id })"
    >
      <svg
        class="w-[calc(24*var(--wall-x))] h-[calc(24*var(--wall-y))]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
      >
        <polyline :points="direction === 'previous' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'" />
      </svg>
    </button>
    <span
      class="absolute z-10 bottom-[calc(16*var(--wall-y))] left-1/2 -translate-x-1/2 h-(--wall-counter-height-y) flex items-center justify-center text-white text-[length:calc(18*var(--wall-x))] font-black tracking-widest bg-black/25 px-[calc(20*var(--wall-x))] rounded-full border border-white/15"
      aria-live="polite"
    >
      {{ String(slide + 1).padStart(2, '0') }} / {{ String(column.slides).padStart(2, '0') }}
    </span>
  </div>
</template>
