<script setup lang="ts">
/** Save / Default buttons and the save status shared by the dashboard forms. */
defineProps<{ dirty: boolean; status: string }>();
defineEmits<{ save: []; defaults: [] }>();
</script>

<template>
  <div class="mt-5 flex flex-wrap items-center gap-2">
    <button
      type="button" class="rounded-lg bg-wall-glow px-5 py-2 font-bold text-[#06124f] hover:bg-sky-200 disabled:cursor-not-allowed disabled:opacity-40"
      :disabled="!dirty" data-dashboard-save @click="$emit('save')"
    >
      Simpan
    </button>
    <button type="button" class="rounded-lg px-4 py-2 font-bold ring-1 ring-white/20 hover:bg-white/10" @click="$emit('defaults')">
      Default
    </button>
    <p class="ml-2 text-sm text-sky-100/70" role="status" aria-live="polite">
      {{ dirty ? 'Belum disimpan' : status }}
    </p>
  </div>
</template>
