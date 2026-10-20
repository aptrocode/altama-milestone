<script setup lang="ts">
/**
 * Save bar shared by the dashboard forms. It sticks to the bottom of the scrolling content, so
 * Simpan stays in reach, and highlights unsaved edits (with their count when known) next to Batal.
 */
defineProps<{ dirty: boolean; status: string; changes?: number }>();
defineEmits<{ save: []; discard: []; defaults: [] }>();
</script>

<template>
  <div
    class="sticky bottom-0 z-20 -mx-1 mt-5 flex flex-wrap items-center gap-2 rounded-xl px-3 py-3 backdrop-blur transition-colors"
    :class="dirty ? 'bg-[#10206e]/95 ring-1 ring-wall-glow/50 shadow-[0_-8px_24px_rgba(2,6,40,0.5)]' : 'bg-[#0a1150]/95 ring-1 ring-white/10'"
  >
    <p class="mr-auto flex items-center gap-2 text-sm" role="status" aria-live="polite" :class="dirty ? 'font-bold text-white' : 'text-sky-100/70'">
      <span v-if="dirty" class="size-2 rounded-full bg-amber-300" aria-hidden="true" />
      {{ dirty ? (changes ? `${changes} perubahan belum disimpan` : 'Belum disimpan') : status }}
    </p>
    <button type="button" class="rounded-lg px-4 py-2 font-bold text-sky-100/80 ring-1 ring-white/20 hover:bg-white/10" @click="$emit('defaults')">
      Default
    </button>
    <button v-if="dirty" type="button" class="rounded-lg px-4 py-2 font-bold ring-1 ring-white/20 hover:bg-white/10" data-dashboard-discard @click="$emit('discard')">
      Batal
    </button>
    <button
      type="button" class="rounded-lg bg-wall-glow px-5 py-2 font-bold text-[#06124f] hover:bg-sky-200 disabled:cursor-not-allowed disabled:opacity-40"
      :disabled="!dirty" data-dashboard-save @click="$emit('save')"
    >
      Simpan
    </button>
  </div>
</template>
