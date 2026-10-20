<script setup lang="ts">
/** On/off switch for dashboard settings, with its state spelled out next to it. */
defineProps<{ modelValue: boolean; label: string }>();
defineEmits<{ 'update:modelValue': [value: boolean] }>();
</script>

<template>
  <div class="flex items-center gap-2.5">
    <span class="w-7 text-right text-xs font-bold uppercase tracking-wide" :class="modelValue ? 'text-emerald-300' : 'text-sky-100/50'" aria-hidden="true">
      {{ modelValue ? 'On' : 'Off' }}
    </span>
    <button
      type="button" role="switch" :aria-checked="modelValue" :aria-label="label"
      class="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wall-glow"
      :class="modelValue ? 'bg-emerald-400' : 'bg-white/20'"
      @click="$emit('update:modelValue', !modelValue)"
    >
      <span class="inline-block size-5 rounded-full bg-white shadow transition-transform" :class="modelValue ? 'translate-x-6' : 'translate-x-1'" />
    </button>
  </div>
</template>
