<script setup lang="ts">
useHead({ title: 'Dashboard · Altama Interactive Wall' });

const runtimeConfig = useRuntimeConfig();
// The Sensor Service runs on the event PC next to the wall; without a configured URL use this host.
const sensorUrl = String(runtimeConfig.public.sensorWsUrl || '') || `ws://${window.location.hostname || '127.0.0.1'}:8787`;
</script>

<template>
  <main class="min-h-dvh overflow-y-auto overscroll-contain touch-pan-y select-text bg-wall-night text-wall-ink font-sans">
    <div class="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <header class="flex items-center justify-between border-b border-white/10 pb-4 sm:pb-6">
        <div>
          <h1 class="font-display text-2xl font-bold uppercase tracking-wider text-white sm:text-3xl">
            Operator Dashboard
          </h1>
          <p class="text-xs text-sky-100/60 sm:text-sm">
            Hold button groups &amp; Sensor Service
          </p>
        </div>
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3.5 py-2 text-xs font-bold uppercase tracking-wide text-wall-glow transition-colors hover:bg-white/15 hover:text-white sm:text-sm"
        >
          Buka wall →
        </NuxtLink>
      </header>

      <div class="mt-6 grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-10 xl:gap-12">
        <section class="w-full">
          <DashboardHold />
        </section>

        <section class="w-full">
          <DashboardSensor :url="sensorUrl" />
        </section>
      </div>
    </div>
  </main>
</template>
