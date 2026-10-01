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
  '--wall-inset-x': `calc(${layout.frame.inset} * var(--wall-x))`,
  '--wall-gap-x': `calc(${layout.frame.gap} * var(--wall-x))`,
  ...Object.fromEntries(Object.entries(layout.controls).flatMap(([key, value]) => [
    [`--wall-${key}-x`, `calc(${value} * var(--wall-x))`],
    [`--wall-${key}-y`, `calc(${value} * var(--wall-y))`],
  ])),
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
    id="wall-container" class="relative w-screen h-dvh bg-white flex flex-col overflow-hidden select-none font-sans"
    :style="stageStyle"
  >
    <div
      id="column-borders" class="absolute inset-0 grid grid-cols-6 px-(--wall-inset-x) gap-(--wall-gap-x) pointer-events-none z-10 transition-opacity duration-300"
      :class="wall.hasAnyActive ? 'opacity-100' : 'opacity-0'" aria-hidden="true"
    >
      <div v-for="column in WALL_CONFIG.columns" :key="column.id" class="min-w-0 border-r border-dashed border-neutral-200/70 first:border-l" />
    </div>

    <div id="zone-top" class="relative w-full shrink-0 overflow-hidden" :style="{ height: `${layout.zones.header * 100}%` }">
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-3"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-250 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-3"
      >
        <div v-if="!wall.hasAnyActive" id="branding-default" class="absolute inset-0 flex flex-col items-center justify-center text-center">
          <h1 class="text-[length:calc(64*var(--wall-x))] italic tracking-[0.14em] text-neutral-800 font-medium">
            ALTAMA
          </h1>
          <p class="text-[length:calc(18*var(--wall-x))] tracking-[0.08em] text-neutral-500 italic mt-[calc(12*var(--wall-y))]">
            SURPASSING HORIZONS, ELEVATING EXCELLENCE
          </p>
        </div>
      </Transition>
      <div id="content-headers" class="absolute inset-0 grid grid-cols-6 px-(--wall-inset-x) gap-(--wall-gap-x)">
        <div
          v-for="column in WALL_CONFIG.columns" :key="column.id" class="min-w-0 flex items-center justify-center text-center px-[calc(28*var(--wall-x))] py-[calc(24*var(--wall-y))]"
          :lang="wall.getColumnLocale(column.id)" :data-col="column.id"
          @pointerdown="controls.touchColumn(column.id)" @keydown="controls.touchColumn(column.id)"
        >
          <Transition
            enter-active-class="transition duration-300 ease-out delay-100"
            enter-from-class="opacity-0 -translate-y-3"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-3"
          >
            <div v-if="wall.getColumnState(column.id) === 'active'" class="w-full grid gap-[calc(16*var(--wall-y))]">
              <h2 class="min-h-[calc(70*var(--wall-y))] flex items-center justify-center text-[length:calc(28*var(--wall-x))] font-black text-emerald-800 uppercase tracking-wide leading-tight wrap-break-word">
                {{ wall.getHeaderTitle(column.id) }}
              </h2>
              <p class="min-h-[calc(160*var(--wall-y))] text-[length:calc(18*var(--wall-x))] text-neutral-600 font-medium leading-relaxed text-balance wrap-break-word">
                {{ wall.getHeaderDesc(column.id) }}
              </p>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <div id="zone-middle" class="w-full grid grid-cols-6 px-(--wall-inset-x) gap-(--wall-gap-x) shrink-0" :style="{ height: `${layout.zones.interactive * 100}%` }">
      <WallColumn
        v-for="column in WALL_CONFIG.columns" :key="column.id"
        :column="column" :snapshot="wall.columns[column.id]" :copy="wall.getColumnCopy(column.id)"
        @action="dispatch" @activity="controls.touchColumn"
      />
    </div>

    <div id="zone-bottom" class="w-full flex-1 min-h-0 flex items-center overflow-hidden">
      <div id="bottom-descriptions" class="w-full grid grid-cols-6 px-(--wall-inset-x) gap-(--wall-gap-x)">
        <div
          v-for="column in WALL_CONFIG.columns" :key="column.id" class="min-w-0 text-center px-[calc(28*var(--wall-x))] py-[calc(24*var(--wall-y))]"
          :lang="wall.getColumnLocale(column.id)" :data-col="column.id"
          @pointerdown="controls.touchColumn(column.id)"
        >
          <Transition
            enter-active-class="transition duration-300 ease-out delay-100"
            enter-from-class="opacity-0 translate-y-3"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-3"
          >
            <div v-if="wall.getColumnState(column.id) === 'active'" class="grid gap-[calc(12*var(--wall-y))]">
              <h3 class="min-h-[calc(48*var(--wall-y))] flex items-center justify-center text-[length:calc(20*var(--wall-x))] font-black uppercase tracking-wide text-emerald-800 leading-tight wrap-break-word">
                {{ wall.getBottomTitle(column.id) }}
              </h3>
              <p class="min-h-[calc(96*var(--wall-y))] text-[length:calc(17*var(--wall-x))] text-neutral-600 leading-relaxed text-balance wrap-break-word">
                {{ wall.getBottomDesc(column.id) }}
              </p>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <KioskStatus
      v-if="showDiagnostics" :socket-status="system.socketStatus" :sensor-ready="system.sensorReady"
      :calibration-ready="system.calibrationReady" :error="system.lastError"
    />
  </main>
</template>
