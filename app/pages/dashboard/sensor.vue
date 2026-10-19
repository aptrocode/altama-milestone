<script setup lang="ts">
import DashboardSensor from '~/components/dashboard/DashboardSensor.vue';

definePageMeta({
  title: 'Sensor',
  description: 'Sumber sentuh, port, kalibrasi Hokuyo, dan status live Sensor Service di PC event.',
});

const runtimeConfig = useRuntimeConfig();
// The Sensor Service runs on the event PC next to the wall; without a configured URL use this host.
const sensorUrl = String(runtimeConfig.public.sensorWsUrl || '') || `ws://${window.location.hostname || '127.0.0.1'}:8787`;
</script>

<template>
  <DashboardSensor :url="sensorUrl" />
</template>
