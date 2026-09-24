<script setup lang="ts">
import type { MilestoneSectionHandle } from '~/types/components';
import type { SectionId } from '~/types/milestone';
import type { SensorMessage } from '~/types/sensor';
import { onMounted, onUnmounted, ref } from 'vue';
import { useAssetCache } from '~/composables/useAssetCache';
import { useSensorSocket } from '~/composables/useSensorSocket';
import { installationLayout } from '~/data/installation-layout';
import { useSystemStore } from '~/stores/system';

const runtimeConfig = useRuntimeConfig();
const system = useSystemStore();
const assetCache = useAssetCache();
const leftSection = ref<MilestoneSectionHandle | null>(null);
const centerSection = ref<MilestoneSectionHandle | null>(null);
const rightSection = ref<MilestoneSectionHandle | null>(null);
const showDiagnostics = ref(false);
const sensorEnabled = runtimeConfig.public.sensorEnabled === true
  || String(runtimeConfig.public.sensorEnabled).toLowerCase() === 'true';

function sectionHandle(section: SectionId): MilestoneSectionHandle | null {
  if (section === 'left')
    return leftSection.value;
  if (section === 'center')
    return centerSection.value;
  return rightSection.value;
}

function handleSensorMessage(message: SensorMessage) {
  if (message.type === 'touchStart')
    void sectionHandle(message.section)?.reveal();
  else if (message.type === 'selectMilestone')
    sectionHandle(message.section)?.selectMilestone(message.milestoneId);
  else if (message.type === 'selectLanguage')
    sectionHandle(message.section)?.setLocale(message.locale);
}

const sensorSocket = useSensorSocket({
  enabled: sensorEnabled,
  url: String(runtimeConfig.public.sensorWsUrl || ''),
  expectedLayoutVersion: installationLayout.layoutVersion,
  onMessage: handleSensorMessage,
});

function resetAll() {
  leftSection.value?.reset();
  centerSection.value?.reset();
  rightSection.value?.reset();
}

function handleKeyboard(event: KeyboardEvent) {
  if (event.code === 'KeyD' && import.meta.dev)
    showDiagnostics.value = !showDiagnostics.value;

  if (event.repeat)
    return;

  if (event.code === 'Digit1')
    void leftSection.value?.reveal();
  else if (event.code === 'Digit2')
    void centerSection.value?.reveal();
  else if (event.code === 'Digit3')
    void rightSection.value?.reveal();
  else if (event.code === 'KeyR')
    resetAll();
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyboard);
  sensorSocket.start();
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyboard);
  sensorSocket.stop();
  assetCache.dispose();
});
</script>

<template>
  <div class="kiosk-shell">
    <div class="kiosk-stage">
      <KioskScenery />
      <MilestoneSection ref="leftSection" section="left" :asset-cache="assetCache" />
      <MilestoneSection ref="centerSection" section="center" :asset-cache="assetCache" />
      <MilestoneSection ref="rightSection" section="right" :asset-cache="assetCache" />
      <footer class="kiosk-motto">
        Pertumbuhan Hari Ini <span>•</span> Peluang Masa Depan <span>•</span> Bersama Lebih Baik
      </footer>
      <KioskStatus
        v-if="showDiagnostics"
        :socket-status="system.socketStatus"
        :sensor-ready="system.sensorReady"
        :calibration-ready="system.calibrationReady"
        :error="system.lastError"
        :cache-ready="assetCache.stats.ready"
        :cache-loading="assetCache.stats.loading"
      />
    </div>
  </div>
</template>

<style scoped>
.kiosk-shell { position: fixed; inset: 0; overflow: clip; background: #fff; }
.kiosk-stage { position: relative; isolation: isolate; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); height: 100%; width: 100%; container-type: inline-size; color: #123477; }
.kiosk-motto { position: absolute; bottom: 2.25%; left: 0; width: 100%; display: flex; justify-content: center; gap: 0.85cqw; color: #1653c1; font-size: 0.78cqw; font-weight: 850; letter-spacing: 0.17em; text-transform: uppercase; }
</style>
