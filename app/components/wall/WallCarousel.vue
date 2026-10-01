<script setup lang="ts">
import type { WallAction, WallLocale } from '../../../shared/wall';
import type { ColumnConfig } from '~/data/wall-config';
import { WALL_COPY } from '~/data/wall-copy';

defineProps<{ column: ColumnConfig; locale: WallLocale; slide: number; label: string }>();
defineEmits<{ action: [action: WallAction] }>();
</script>

<template>
  <div class="wall-active flex-1 flex flex-col min-h-0 animate-kiosk-enter">
    <div class="wall-active-heading flex items-center justify-between shrink-0">
      <span class="text-xs font-black text-emerald-900 uppercase tracking-wide truncate">{{ label }}</span>
      <button
        type="button" class="wall-back rounded-full bg-neutral-200 text-neutral-700 hover:bg-red-500 hover:text-white cursor-pointer"
        :aria-label="WALL_COPY[locale].back" data-sensor-action="back"
        @click="$emit('action', { type: 'back', columnId: column.id })"
      >
        <span aria-hidden="true">✕</span>
      </button>
    </div>
    <div class="flex-1 flex flex-col bg-gradient-to-b from-[#1b4d3e] to-[#12362b] rounded-xl min-h-0 shadow-sm overflow-hidden">
      <div class="flex-1 relative min-h-0 overflow-hidden">
        <div
          v-for="index in column.slides" :key="index"
          class="absolute inset-0 flex items-center justify-center transition-all duration-500"
          :class="slide === index - 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'"
          :aria-hidden="slide !== index - 1" :data-slide="index"
        >
          <div class="w-[85%] h-[75%] flex flex-col items-center justify-center bg-black/25 border-2 border-dashed border-white/25 rounded-lg gap-2 text-white/90 shadow-inner">
            <svg viewBox="0 0 100 80" class="w-9 h-7 text-white/50" aria-hidden="true">
              <polygon points="50,15 85,65 15,65" fill="currentColor" />
            </svg>
            <span class="text-xs uppercase tracking-wide font-bold">{{ WALL_COPY[locale].photo }} {{ String(index).padStart(2, '0') }}</span>
          </div>
        </div>
      </div>
      <div class="wall-carousel-controls flex items-center justify-between shrink-0">
        <button
          v-for="direction in ['previous', 'next'] as const" :key="direction" type="button"
          class="wall-carousel-arrow flex items-center justify-center bg-white/20 hover:bg-white/30 border border-white/40 rounded-lg text-white cursor-pointer shadow-xs"
          :class="{ 'order-3': direction === 'next' }" :aria-label="WALL_COPY[locale][direction]"
          :data-sensor-action="direction" @click="$emit('action', { type: direction, columnId: column.id })"
        >
          <svg
            class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
          >
            <polyline :points="direction === 'previous' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'" />
          </svg>
        </button>
        <span
          class="order-2 text-white text-xs font-black tracking-widest bg-black/20 px-2.5 py-1 rounded-full border border-white/10"
          aria-live="polite"
        >
          {{ String(slide + 1).padStart(2, '0') }} / {{ String(column.slides).padStart(2, '0') }}
        </span>
      </div>
    </div>
  </div>
</template>
