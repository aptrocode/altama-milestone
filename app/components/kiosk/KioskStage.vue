<script setup lang="ts">
import type { ColumnConfig } from '~/data/wall-config';
import type { SensorMessage } from '~/types/sensor';
import { onMounted, onUnmounted, ref } from 'vue';
import KioskStatus from '~/components/kiosk/KioskStatus.vue';
import { useSensorSocket } from '~/composables/useSensorSocket';
import { installationLayout } from '~/data/installation-layout';
import { WALL_CONFIG } from '~/data/wall-config';
import { useSystemStore } from '~/stores/system';
import { useWallStore } from '~/stores/wall';

const wall = useWallStore();
const system = useSystemStore();
const runtimeConfig = useRuntimeConfig();

const showDiagnostics = ref(false);
const sensorEnabled = runtimeConfig.public.sensorEnabled === true
  || String(runtimeConfig.public.sensorEnabled).toLowerCase() === 'true';

function getHeaderTitle(col: ColumnConfig): string {
  if (col.type === 'expandable') {
    const subKey = wall.getActiveSubItem(col.id);
    return WALL_CONFIG.subItemContent[subKey]?.title || col.headerTitle;
  }
  return col.headerTitle;
}

function getHeaderDesc(col: ColumnConfig): string {
  if (col.type === 'expandable') {
    const subKey = wall.getActiveSubItem(col.id);
    return WALL_CONFIG.subItemContent[subKey]?.desc || col.headerDesc;
  }
  return col.headerDesc;
}

function getBottomTitle(col: ColumnConfig): string {
  if (col.type === 'expandable') {
    const subKey = wall.getActiveSubItem(col.id);
    return WALL_CONFIG.subItemContent[subKey]?.title || col.bottomTitle;
  }
  return col.bottomTitle;
}

function getActiveLabel(col: ColumnConfig): string {
  if (col.type === 'expandable') {
    const subKey = wall.getActiveSubItem(col.id);
    const sub = col.subItems?.find(s => s.key === subKey);
    return sub?.label || col.parentLabel || col.label;
  }
  return col.label;
}

// ── Sensor Socket handler ──
function handleSensorMessage(message: SensorMessage) {
  if (message.type === 'touchStart') {
    // Map touch to column or reset
    if (message.section === 'left')
      wall.onMainButtonClick(1);
    else if (message.section === 'center')
      wall.onMainButtonClick(2);
    else if (message.section === 'right')
      wall.onMainButtonClick(5);
  }
}

const sensorSocket = useSensorSocket({
  enabled: sensorEnabled,
  url: String(runtimeConfig.public.sensorWsUrl || ''),
  expectedLayoutVersion: installationLayout?.layoutVersion || 'layout-v4',
  onMessage: handleSensorMessage,
});

// ── Keyboard shortcuts ──
function handleKeyboard(e: KeyboardEvent) {
  if (e.code === 'KeyD' && import.meta.dev) {
    showDiagnostics.value = !showDiagnostics.value;
  }

  if (e.key === 'Escape' || e.code === 'KeyR') {
    wall.resetAll();
  }

  if (!e.repeat && ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6'].includes(e.code)) {
    const colId = parseInt(e.code.replace('Digit', ''), 10);
    wall.onMainButtonClick(colId);
  }
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
  <div id="wall-container">
    <!-- ====== COLUMN BORDERS (FULL HEIGHT OVERLAY) ====== -->
    <div id="column-borders" class="column-borders" :class="{ hidden: !wall.hasAnyActive }">
      <div v-for="col in WALL_CONFIG.columns" :key="`border-${col.id}`" class="col-border" :data-col="col.id" />
    </div>

    <!-- ====== ROW 1: ZONA ATAS (BRANDING / HEADER) ====== -->
    <div id="zone-top" class="zone zone-top">
      <!-- Default branding (shown when all columns are idle) -->
      <div id="branding-default" class="branding-default" :class="{ hidden: wall.hasAnyActive }">
        <div class="branding-logo">
          <h1>ALTAMA</h1>
          <p class="branding-tagline">
            SURPASSING HORIZONS, ELEVATING EXCELLENCE
          </p>
        </div>
      </div>

      <!-- Content headers (shown when at least one column is active) -->
      <div id="content-headers" class="content-headers" :class="{ hidden: !wall.hasAnyActive }">
        <div
          v-for="col in WALL_CONFIG.columns"
          :key="`header-${col.id}`"
          class="content-header"
          :data-col="col.id"
          :class="{
            'col-hidden': wall.getColumnState(col.id) !== 'active',
            'active anim-slide-down': wall.getColumnState(col.id) === 'active',
          }"
        >
          <h2 class="content-header-title" :data-col="col.id">
            {{ getHeaderTitle(col) }}
          </h2>
          <p>{{ getHeaderDesc(col) }}</p>
        </div>
      </div>
    </div>

    <!-- ====== ROW 2: ZONA TENGAH (INTERACTIVE BUTTONS) ====== -->
    <div id="zone-middle" class="zone zone-middle">
      <div
        v-for="col in WALL_CONFIG.columns"
        :key="`col-${col.id}`"
        class="column"
        :class="{ 'has-submenu': col.type === 'expandable' }"
        :data-col="col.id"
      >
        <!-- Main Button (Idle State) -->
        <div class="btn-group" :class="{ hidden: wall.getColumnState(col.id) !== 'idle' }">
          <button
            v-hold="() => wall.onMainButtonClick(col.id)"
            class="main-btn"
            :class="{ 'single-btn': col.type === 'single', 'expandable-btn': col.type === 'expandable' }"
            :data-category="col.key"
            :data-col="col.id"
          >
            <span class="btn-label" v-html="col.labelHtml" />
          </button>
        </div>

        <!-- Submenu Group (Expandable columns in Submenu State) -->
        <div
          v-if="col.type === 'expandable'"
          class="submenu-group"
          :class="{
            'hidden': wall.getColumnState(col.id) !== 'submenu',
            'anim-fade-in': wall.getColumnState(col.id) === 'submenu',
          }"
          :data-col="col.id"
        >
          <span class="submenu-parent-label">{{ col.parentLabel }}</span>
          <button
            v-for="sub in col.subItems"
            :key="sub.key"
            v-hold="() => wall.onSubButtonClick(col.id, sub.key)"
            class="sub-btn"
            :class="{ active: wall.getActiveSubItem(col.id) === sub.key }"
            :data-sub="sub.key"
            :data-col="col.id"
          >
            <span class="btn-label" v-html="sub.labelHtml || sub.label" />
          </button>
        </div>

        <!-- Active Content / Carousel (Active State) -->
        <div
          class="active-content"
          :class="{
            'hidden': wall.getColumnState(col.id) !== 'active',
            'anim-scale-in': wall.getColumnState(col.id) === 'active',
          }"
          :data-col="col.id"
        >
          <span class="submenu-parent-label">{{ getActiveLabel(col) }}</span>
          <div class="carousel" :data-col="col.id">
            <div class="carousel-viewport">
              <div
                v-for="slideIdx in col.slides"
                :key="`slide-${slideIdx}`"
                class="carousel-slide"
                :class="{ active: wall.getCarouselIndex(col.id) === slideIdx - 1 }"
              >
                <div class="placeholder-img">
                  <svg viewBox="0 0 100 80" class="img-icon">
                    <polygon points="50,15 85,65 15,65" fill="currentColor" />
                  </svg>
                  <span>PLACEHOLDER FOTO {{ String(slideIdx).padStart(2, '0') }}</span>
                </div>
              </div>
            </div>
            <div class="carousel-controls">
              <button
                v-hold="() => wall.navigateCarousel(col.id, -1, col.slides)"
                class="carousel-prev"
                aria-label="Previous"
              >
                ←
              </button>
              <button
                v-hold="() => wall.navigateCarousel(col.id, 1, col.slides)"
                class="carousel-next"
                aria-label="Next"
              >
                →
              </button>
            </div>
            <div class="carousel-indicator">
              {{ String(wall.getCarouselIndex(col.id) + 1).padStart(2, '0') }} / {{ String(col.slides).padStart(2, '0') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ====== ROW 3: ZONA BAWAH ====== -->
    <div id="zone-bottom" class="zone zone-bottom">
      <div id="bottom-descriptions" class="bottom-descriptions" :class="{ hidden: !wall.hasAnyActive }">
        <div
          v-for="col in WALL_CONFIG.columns"
          :key="`bottom-${col.id}`"
          class="bottom-desc"
          :data-col="col.id"
          :class="{ 'col-hidden': wall.getColumnState(col.id) !== 'active' }"
        >
          <h4 class="bottom-desc-title" :data-col="col.id">
            {{ getBottomTitle(col) }}
          </h4>
          <p>{{ col.bottomDesc }}</p>
        </div>
      </div>
    </div>

    <!-- Diagnostics overlay (toggled with 'D' key in dev) -->
    <KioskStatus
      v-if="showDiagnostics"
      :socket-status="system.socketStatus"
      :sensor-ready="system.sensorReady"
      :calibration-ready="system.calibrationReady"
      :error="system.lastError"
      :cache-ready="6"
      :cache-loading="0"
    />
  </div>
</template>

<style scoped>
/* Scoped overrides if needed; all global design tokens reside in main.css */
</style>
