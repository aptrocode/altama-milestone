<script setup lang="ts">
useHead({ title: 'Dashboard · Altama Interactive Wall' });

const runtimeConfig = useRuntimeConfig();
// The Sensor Service runs on the event PC next to the wall; without a configured URL use this host.
const sensorUrl = String(runtimeConfig.public.sensorWsUrl || '') || `ws://${window.location.hostname || '127.0.0.1'}:8787`;
</script>

<template>
  <main class="h-dvh overflow-y-auto overscroll-contain touch-pan-y select-text bg-wall-night text-wall-ink font-sans">
    <div class="mx-auto w-full max-w-xl px-4 py-8 sm:py-12">
      <header class="flex justify-end">
        <NuxtLink to="/" class="text-sm font-bold uppercase tracking-wide text-wall-glow hover:text-white">
          Buka wall →
        </NuxtLink>
      </header>

      <DashboardHold class="mt-2" />
      <DashboardSensor class="mt-12" :url="sensorUrl" />
    </div>
  </main>
</template>
