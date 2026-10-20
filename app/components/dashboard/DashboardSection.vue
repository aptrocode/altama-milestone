<script setup lang="ts">
/** A titled group of dashboard settings; `warning` marks diagnostics that must be off at the event. */
defineProps<{ title: string; description?: string; icon: 'display' | 'buttons' | 'timer' | 'diagnostic'; warning?: boolean }>();

const ICONS = {
  display: 'M3 5h18v11H3zM8 20h8M12 16v4',
  buttons: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM15 16.5h4M17 14.5v4',
  timer: 'M12 8v5l3 2M9 2h6M12 22a8 8 0 1 0 0-16 8 8 0 0 0 0 16z',
  diagnostic: 'M12 3v3M12 18v3M3 12h3M18 12h3M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
} as const;
</script>

<template>
  <section
    class="rounded-xl px-4 pt-4 pb-1 ring-1"
    :class="warning ? 'bg-amber-300/[0.06] ring-amber-300/30' : 'bg-white/5 ring-white/10'"
  >
    <header class="flex items-center gap-3 pb-1">
      <span class="grid size-9 shrink-0 place-items-center rounded-lg" :class="warning ? 'bg-amber-300/15 text-amber-200' : 'bg-wall-glow/15 text-wall-glow'">
        <svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path :d="ICONS[icon]" />
        </svg>
      </span>
      <div class="min-w-0">
        <h2 class="font-display text-lg font-bold uppercase tracking-wide text-white">
          {{ title }}
        </h2>
        <p v-if="description" class="text-sm text-sky-100/60">
          {{ description }}
        </p>
      </div>
      <slot name="badge" />
    </header>
    <div class="divide-y divide-white/10">
      <slot />
    </div>
  </section>
</template>
