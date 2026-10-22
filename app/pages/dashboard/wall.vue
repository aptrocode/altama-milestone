<script setup lang="ts">
import DashboardWall from '~/components/dashboard/DashboardWall.vue';

definePageMeta({
  title: 'Wall',
  description: 'Tampilan, tombol di card, dan waktu reset wall. Simpan untuk menerapkan ke wall (ke semua device saat tersinkron ke server).',
});
</script>

<template>
  <DashboardWall />
</template>
