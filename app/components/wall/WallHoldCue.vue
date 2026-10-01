<script setup lang="ts">
import type { WallLocale } from '../../../shared/wall';
import { WALL_COPY } from '~/data/wall-copy';

defineProps<{ locale: WallLocale; selected?: boolean }>();
</script>

<template>
  <span
    class="inline-flex items-center justify-center gap-[calc(8*var(--wall-x))] px-[calc(14*var(--wall-x))] py-[calc(7*var(--wall-y))] border rounded-full pointer-events-none text-[length:calc(13*var(--wall-x))] font-black tracking-widest"
    :class="selected ? 'bg-emerald-800 border-emerald-600 text-emerald-100' : 'bg-emerald-50 border-emerald-200 text-emerald-800'"
  >
    <svg
      class="hand-hint w-[calc(18*var(--wall-x))] h-[calc(18*var(--wall-y))] shrink-0" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
    >
      <path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2" />
      <path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2" />
      <path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
    </svg>
    {{ WALL_COPY[locale].hold }}
  </span>
</template>

<style scoped>
@media (prefers-reduced-motion: no-preference) {
  .hand-hint {
    animation: hand-press 2s ease-in-out infinite;
  }
}

@keyframes hand-press {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.12); }
}
</style>
