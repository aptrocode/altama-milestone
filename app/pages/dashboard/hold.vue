<script setup lang="ts">
import DashboardHold from '~/components/dashboard/DashboardHold.vue';

definePageMeta({
  title: 'Hold',
  description: 'Tombol mana yang harus ditahan dan berapa lama. Tersimpan di browser ini dan dikirim ke Sensor Service.',
});
</script>

<template>
  <DashboardHold />
</template>
