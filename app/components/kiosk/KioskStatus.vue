<script setup lang="ts">
import type { SensorSocketStatus } from '~/types/sensor';

defineProps<{
  socketStatus: SensorSocketStatus;
  sensorReady: boolean;
  calibrationReady: boolean;
  error: string | null;
}>();
</script>

<template>
  <aside class="pointer-events-none absolute top-[1cqw] right-[1cqw] z-50 flex items-center gap-[0.65cqw] rounded-full border border-white/10 bg-[#02060d]/72 px-[0.85cqw] py-[0.48cqw] text-[0.48cqw] tracking-[0.12em] text-white/55 uppercase backdrop-blur-md">
    <span
      class="h-[0.4cqw] w-[0.4cqw] rounded-full"
      :class="sensorReady && calibrationReady ? 'bg-emerald-300' : socketStatus === 'disabled' ? 'bg-white/30' : 'bg-amber-300'"
    />
    <span>{{ socketStatus }}</span>
    <span class="text-white/22">/</span>
    <span>{{ sensorReady && calibrationReady ? 'sensor siap' : 'sensor belum siap' }}</span>
    <span v-if="error" class="truncate text-red-300">· {{ error }}</span>
  </aside>
</template>
