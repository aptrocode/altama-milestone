<script setup lang="ts">
import type { WallAction } from '../../../shared/wall';
import type { SensorMessage } from '~/types/sensor';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import KioskBackground from '~/components/kiosk/KioskBackground.vue';
import KioskStatus from '~/components/kiosk/KioskStatus.vue';
import WallColumn from '~/components/wall/WallColumn.vue';
import { useSensorSocket } from '~/composables/useSensorSocket';
import { useWallController } from '~/composables/useWallController';
import { installationLayout } from '~/data/installation-layout';
import { WALL_CONFIG } from '~/data/wall-config';
import { STAGE_MEDIA } from '~/data/wall-media';
import { useSystemStore } from '~/stores/system';
import { useWallStore } from '~/stores/wall';
import { COLUMN_IDS } from '../../../shared/wall';

const wall = useWallStore();
const controls = useWallController(wall);
const system = useSystemStore();
const runtimeConfig = useRuntimeConfig();
const showDiagnostics = ref(false);
const layout = installationLayout;
const stageStyle = {
  '--wall-x': `calc(100vw / ${layout.canvas.width})`,
  '--wall-y': `calc(100dvh / ${layout.canvas.height})`,
};
// The large idle logo overlaps the raised titles of columns 3/4, so it shrinks only while one of them is open.
const compactLogo = computed(() => wall.getColumnState(3) !== 'idle' || wall.getColumnState(4) !== 'idle');
const logoBox = computed(() => compactLogo.value ? layout.visual.logo.compact : layout.visual.logo.idle);

function handleSensorMessage(message: SensorMessage) {
  if (message.type === 'input')
    controls.dispatch(message.action);
}

const sensorSocket = useSensorSocket({
  enabled: String(runtimeConfig.public.sensorEnabled).toLowerCase() === 'true',
  url: String(runtimeConfig.public.sensorWsUrl || ''),
  expectedLayoutVersion: layout.layoutVersion,
  onMessage: handleSensorMessage,
  getColumns: () => wall.publishedColumns,
});

wall.$subscribe(() => sensorSocket.publishState(), { flush: 'post' });

function handleKeyboard(event: KeyboardEvent) {
  if (event.repeat || event.ctrlKey || event.altKey || event.metaKey)
    return;
  if (event.code === 'KeyD' && import.meta.dev)
    showDiagnostics.value = !showDiagnostics.value;
  if (event.key === 'Escape' || event.code === 'KeyR')
    controls.resetAll();
  const columnId = COLUMN_IDS.find(id => event.code === `Digit${id}` || event.code === `Numpad${id}`);
  if (columnId) {
    controls.dispatch({ type: wall.getColumnState(columnId) === 'idle' ? 'main' : 'back', columnId });
    return;
  }
  if (event.code === 'ArrowLeft' || event.code === 'PageUp') {
    const activeCol = COLUMN_IDS.find(id => wall.getColumnState(id) === 'active');
    if (activeCol)
      controls.dispatch({ type: 'previous', columnId: activeCol });
    return;
  }
  if (event.code === 'ArrowRight' || event.code === 'PageDown') {
    const activeCol = COLUMN_IDS.find(id => wall.getColumnState(id) === 'active');
    if (activeCol)
      controls.dispatch({ type: 'next', columnId: activeCol });
  }
}

function dispatch(action: WallAction) {
  controls.dispatch(action);
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyboard);
  sensorSocket.start();
});
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyboard);
  sensorSocket.stop();
});
</script>

<template>
  <main
    id="wall-container" class="relative isolate w-screen h-dvh overflow-hidden bg-wall-night text-wall-ink select-none font-sans"
    :style="stageStyle"
  >
    <KioskBackground class="-z-10" />

    <img
      v-if="STAGE_MEDIA.logo" :src="STAGE_MEDIA.logo.src" alt="ALTAMA Summit 2026: Powering Partnership"
      class="absolute left-1/2 -translate-x-1/2 w-auto max-w-none object-contain pointer-events-none transition-[top,height] duration-500 ease-out motion-reduce:transition-none"
      :style="{ top: `calc(${logoBox.y} * var(--wall-y))`, height: `calc(${logoBox.height} * var(--wall-y))` }"
    >

    <WallColumn
      v-for="column in WALL_CONFIG.columns" :key="column.id"
      :column="column" :snapshot="wall.columns[column.id]" :copy="wall.getColumnCopy(column.id)"
      @action="dispatch" @activity="controls.touchColumn"
    />

    <KioskStatus
      v-if="showDiagnostics" :socket-status="system.socketStatus" :sensor-ready="system.sensorReady"
      :calibration-ready="system.calibrationReady" :error="system.lastError"
    />
  </main>
</template>
