<script setup lang="ts">
import type { WallAction } from '../../../shared/wall';
import type { SensorMessage } from '~/types/sensor';
import { onMounted, onUnmounted, ref } from 'vue';
import KioskStatus from '~/components/kiosk/KioskStatus.vue';
import WallColumn from '~/components/wall/WallColumn.vue';
import { useSensorSocket } from '~/composables/useSensorSocket';
import { useWallController } from '~/composables/useWallController';
import { installationLayout } from '~/data/installation-layout';
import { WALL_CONFIG } from '~/data/wall-config';
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
  '--wall-inset': layout.frame.inset,
  '--wall-gap': layout.frame.gap,
  ...Object.fromEntries(Object.entries(layout.controls).map(([key, value]) => [`--wall-${key}`, value])),
};

function handleSensorMessage(message: SensorMessage) {
  if (message.type === 'input')
    controls.dispatch(message.action);
}

const sensorSocket = useSensorSocket({
  enabled: String(runtimeConfig.public.sensorEnabled).toLowerCase() === 'true',
  url: String(runtimeConfig.public.sensorWsUrl || ''),
  expectedLayoutVersion: layout.layoutVersion,
  onMessage: handleSensorMessage,
  getColumns: () => wall.columns,
});

wall.$subscribe(() => sensorSocket.publishState(), { flush: 'post' });

function handleKeyboard(event: KeyboardEvent) {
  if (event.repeat || event.ctrlKey || event.altKey || event.metaKey)
    return;
  if (event.code === 'KeyD' && import.meta.dev)
    showDiagnostics.value = !showDiagnostics.value;
  if (event.key === 'Escape' || event.code === 'KeyR')
    controls.resetAll();
  const columnId = COLUMN_IDS.find(id => event.code === `Digit${id}`);
  if (columnId)
    controls.dispatch({ type: wall.getColumnState(columnId) === 'idle' ? 'main' : 'back', columnId });
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
    id="wall-container" class="relative w-screen h-dvh bg-white flex flex-col overflow-hidden select-none font-sans"
    :style="stageStyle"
  >
    <div
      id="column-borders" class="absolute inset-0 wall-row flex pointer-events-none z-10 transition-opacity"
      :class="wall.hasAnyActive ? 'opacity-100' : 'opacity-0'" aria-hidden="true"
    >
      <div v-for="column in WALL_CONFIG.columns" :key="column.id" class="flex-1 border-r border-dashed border-red-500/25 first:border-l" />
    </div>

    <div id="zone-top" class="relative w-full shrink-0 overflow-hidden" :style="{ height: `${layout.zones.header * 100}%` }">
      <div v-if="!wall.hasAnyActive" id="branding-default" class="absolute inset-0 flex flex-col items-center justify-center text-center">
        <h1 class="text-3xl lg:text-4xl italic tracking-[0.14em] text-neutral-800 font-normal">
          ALTAMA
        </h1>
        <p class="text-xs md:text-sm tracking-[0.08em] text-neutral-500 italic mt-1">
          SURPASSING HORIZONS, ELEVATING EXCELLENCE
        </p>
      </div>
      <div id="content-headers" class="absolute inset-0 wall-row flex">
        <div
          v-for="column in WALL_CONFIG.columns" :key="column.id" class="flex-1 min-w-0 flex items-center justify-center text-center p-2"
          :lang="wall.getColumnLocale(column.id)" :data-col="column.id"
          @pointerdown="controls.touchColumn(column.id)" @keydown="controls.touchColumn(column.id)"
        >
          <div v-if="wall.getColumnState(column.id) === 'active'" class="animate-kiosk-enter">
            <h2 class="text-[clamp(13px,1.2vw,22px)] font-black text-emerald-800 uppercase mb-1.5 tracking-wide leading-tight">
              {{ wall.getHeaderTitle(column.id) }}
            </h2>
            <p class="text-[11px] md:text-xs text-neutral-600 font-medium leading-relaxed">
              {{ wall.getHeaderDesc(column.id) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div id="zone-middle" class="w-full wall-row flex shrink-0" :style="{ height: `${layout.zones.interactive * 100}%` }">
      <WallColumn
        v-for="column in WALL_CONFIG.columns" :key="column.id"
        :column="column" :snapshot="wall.columns[column.id]" :copy="wall.getColumnCopy(column.id)"
        @action="dispatch" @activity="controls.touchColumn"
      />
    </div>

    <div id="zone-bottom" class="w-full flex-1 flex items-end overflow-hidden pb-3">
      <div id="bottom-descriptions" class="w-full wall-row flex">
        <div
          v-for="column in WALL_CONFIG.columns" :key="column.id" class="flex-1 min-w-0 p-2"
          :lang="wall.getColumnLocale(column.id)" :data-col="column.id"
          @pointerdown="controls.touchColumn(column.id)"
        >
          <div v-if="wall.getColumnState(column.id) === 'active'" class="animate-kiosk-enter">
            <h3 class="text-xs font-black uppercase mb-1 tracking-wide text-emerald-800">
              {{ wall.getBottomTitle(column.id) }}
            </h3>
            <p class="text-xs text-neutral-600 leading-normal">
              {{ wall.getBottomDesc(column.id) }}
            </p>
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
