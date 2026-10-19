<script setup lang="ts">
import type { ColumnId, WallAction } from '../../../shared/wall';
import type { SensorMessage } from '~/types/sensor';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import KioskBackground from '~/components/kiosk/KioskBackground.vue';
import KioskStatus from '~/components/kiosk/KioskStatus.vue';
import WallColumn from '~/components/wall/WallColumn.vue';
import { useSensorSocket } from '~/composables/useSensorSocket';
import { useStackedLayout } from '~/composables/useStackedLayout';
import { useWallController } from '~/composables/useWallController';
import { getColumnLayout, installationLayout } from '~/data/installation-layout';
import { getColumnConfig, WALL_CONFIG } from '~/data/wall-config';
import { STAGE_MEDIA } from '~/data/wall-media';
import { useSettingsStore } from '~/stores/settings';
import { useSystemStore } from '~/stores/system';
import { useWallStore } from '~/stores/wall';
import { COLUMN_IDS } from '../../../shared/wall';

const wall = useWallStore();
const controls = useWallController(wall);
const system = useSystemStore();
const settings = useSettingsStore();
const runtimeConfig = useRuntimeConfig();
const showDiagnostics = ref(false);
const layout = installationLayout;
// LED wall: one logical pixel per axis, scaled independently to fill the viewport.
// Font sizes use --wall-u (the smaller axis) so text never outgrows its box on other aspect ratios.
const wallStyle = {
  '--wall-x': `calc(100vw / ${layout.canvas.width})`,
  '--wall-y': `calc(100dvh / ${layout.canvas.height})`,
  '--wall-u': 'min(var(--wall-x), var(--wall-y))',
};
const stacked = useStackedLayout();
const stackedView = layout.visual.stacked;

// Phones/tablets: each column is drawn in its own box with a uniform scale (container width),
// showing only the logical rows its idle frame or open layout uses.
function stackedWindow(id: ColumnId) {
  if (wall.getColumnState(id) === 'idle')
    return stackedView.idle;
  return getColumnConfig(id).type === 'expandable' ? stackedView.open : stackedView.openSingle;
}

function stackedBox(id: ColumnId) {
  const view = stackedWindow(id);
  return {
    '--wall-x': `calc(100cqw / ${layout.frame.columnWidth + stackedView.padX * 2})`,
    '--wall-y': 'var(--wall-x)',
    '--wall-u': 'var(--wall-x)',
    'height': `calc(${view.height} * var(--wall-x))`,
  };
}

function stackedOrigin(id: ColumnId) {
  const view = stackedWindow(id);
  return { x: getColumnLayout(id).section.x - stackedView.padX, y: view.y };
}
// The large idle logo overlaps the open titles and rails of columns 3/4, so it shrinks only while one of them is open.
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
  getHold: () => settings.hold,
});

wall.$subscribe(() => sensorSocket.publishState(), { flush: 'post' });
settings.$subscribe(() => sensorSocket.publishState(), { flush: 'post' });

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
    id="wall-container" class="relative isolate w-screen h-dvh bg-wall-night text-wall-ink select-none font-sans"
    :class="stacked ? 'overflow-y-auto overscroll-contain touch-pan-y' : 'overflow-hidden touch-none'"
    :style="stacked ? undefined : wallStyle" :data-layout="stacked ? 'stacked' : 'wall'"
  >
    <KioskBackground class="-z-10" />

    <template v-if="!stacked">
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
    </template>

    <div v-else class="mx-auto w-full max-w-5xl px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      <img
        v-if="STAGE_MEDIA.logo" :src="STAGE_MEDIA.logo.src" alt="ALTAMA Summit 2026: Powering Partnership"
        class="mx-auto w-[min(88%,30rem)] h-auto pointer-events-none"
      >
      <div class="mt-4 grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <div v-for="column in WALL_CONFIG.columns" :key="column.id" class="@container min-w-0">
          <div class="relative overflow-hidden transition-[height] duration-500 ease-out motion-reduce:transition-none" :style="stackedBox(column.id)">
            <WallColumn
              :column="column" :snapshot="wall.columns[column.id]" :copy="wall.getColumnCopy(column.id)" :origin="stackedOrigin(column.id)"
              @action="dispatch" @activity="controls.touchColumn"
            />
          </div>
        </div>
      </div>
    </div>

    <KioskStatus
      v-if="showDiagnostics" :socket-status="system.socketStatus" :sensor-ready="system.sensorReady"
      :calibration-ready="system.calibrationReady" :error="system.lastError"
    />
  </main>
</template>
