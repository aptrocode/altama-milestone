<script setup lang="ts">
import type { ColumnIcon } from '~/types/wall-content';
import WallColumnIcon from '~/components/wall/WallColumnIcon.vue';

defineProps<{ icon: ColumnIcon; label: string }>();
</script>

<template>
  <div
    class="wall-pill flex items-center gap-[calc(10*var(--wall-x))] pl-[calc(6*var(--wall-x))] pr-[calc(16*var(--wall-x))] [border-radius:calc(18*var(--wall-x))/calc(18*var(--wall-y))] bg-linear-to-b from-[#112a9c]/95 via-[#0a1a78]/95 to-[#071056]/95 ring-2 ring-wall-glow/70 shadow-[0_0_calc(18*var(--wall-x))_rgba(80,190,255,0.5),inset_0_calc(2*var(--wall-y))_calc(10*var(--wall-y))_rgba(255,255,255,0.12)]"
  >
    <span class="shrink-0 w-[calc(84*var(--wall-x))] h-[calc(84*var(--wall-y))] flex items-center justify-center rounded-full ring-3 ring-wall-glow bg-[#0b1a78] text-white shadow-[0_0_calc(16*var(--wall-x))_rgba(102,204,255,0.8),inset_0_0_calc(12*var(--wall-x))_rgba(102,204,255,0.45)]">
      <WallColumnIcon :icon="icon" class="w-[calc(46*var(--wall-x))] h-[calc(46*var(--wall-y))]" />
    </span>
    <h2 class="flex-1 min-w-0 text-center font-display text-[length:calc(31*var(--wall-x))] font-normal uppercase leading-[1.08] tracking-[0.01em] text-white text-balance drop-shadow-[0_0_calc(6*var(--wall-x))_rgba(102,204,255,0.5)]">
      {{ label }}
    </h2>
    <span class="pointer-events-none absolute right-0 bottom-0 w-[calc(54*var(--wall-x))] h-[calc(40*var(--wall-y))] bg-linear-to-tl from-sky-200/90 via-wall-glow/40 to-transparent [clip-path:polygon(100%_8%,100%_100%,6%_100%)] [border-bottom-right-radius:calc(18*var(--wall-x))_calc(18*var(--wall-y))]" aria-hidden="true" />
  </div>
</template>
