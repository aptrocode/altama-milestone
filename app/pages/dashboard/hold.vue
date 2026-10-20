<script setup lang="ts">
import DashboardHold from '~/components/dashboard/DashboardHold.vue';

definePageMeta({
  title: 'Hold',
  description: 'Cara menekan setiap jenis tombol: tap, hold, atau tap + delay, dan berapa lama. Tersimpan di browser ini dan dikirim ke Sensor Service.',
});
</script>

<template>
  <DashboardHold />
</template>
