<script setup lang="ts">
import type { WallLocale } from '~/data/wall-config';
import type { SensorMessage } from '~/types/sensor';
import { onMounted, onUnmounted, ref } from 'vue';
import KioskStatus from '~/components/kiosk/KioskStatus.vue';
import { useSensorSocket } from '~/composables/useSensorSocket';
import { installationLayout } from '~/data/installation-layout';
import { WALL_CONFIG, WALL_LOCALES } from '~/data/wall-config';
import { useSystemStore } from '~/stores/system';
import { useWallStore } from '~/stores/wall';

const wall = useWallStore();
const system = useSystemStore();
const runtimeConfig = useRuntimeConfig();

const showDiagnostics = ref(false);
const sensorEnabled = runtimeConfig.public.sensorEnabled === true
  || String(runtimeConfig.public.sensorEnabled).toLowerCase() === 'true';

function getFlagSrc(locale: WallLocale): string {
  switch (locale) {
    case 'en':
      return '/flags/english.svg';
    case 'zh-Hans':
      return '/flags/china.svg';
    case 'id':
    default:
      return '/flags/indonesia.svg';
  }
}

function getHoldCueText(colId: number): string {
  const locale = wall.getColumnLocale(colId);
  if (locale === 'en')
    return 'HOLD 3 SECONDS';
  if (locale === 'zh-Hans')
    return '长按 3 秒';
  return 'HOLD 3 DETIK';
}

function getBackLabel(colId: number): string {
  const locale = wall.getColumnLocale(colId);
  if (locale === 'en')
    return 'BACK';
  if (locale === 'zh-Hans')
    return '返回';
  return 'KEMBALI';
}

function getSlidePlaceholderText(colId: number, slideIdx: number): string {
  const locale = wall.getColumnLocale(colId);
  const num = String(slideIdx).padStart(2, '0');
  if (locale === 'en')
    return `PHOTO ${num}`;
  if (locale === 'zh-Hans')
    return `图片 ${num}`;
  return `FOTO ${num}`;
}

function getPrevLabel(colId: number): string {
  const locale = wall.getColumnLocale(colId);
  if (locale === 'en')
    return 'Previous';
  if (locale === 'zh-Hans')
    return '上一张';
  return 'Sebelumnya';
}

function getNextLabel(colId: number): string {
  const locale = wall.getColumnLocale(colId);
  if (locale === 'en')
    return 'Next';
  if (locale === 'zh-Hans')
    return '下一张';
  return 'Berikutnya';
}

// ── Sensor Socket handler ──
function handleSensorMessage(message: SensorMessage) {
  if (message.type === 'touchStart') {
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
  <div
    id="wall-container"
    class="relative w-screen h-[calc(100vw*7/12)] max-w-[calc(100vh*12/7)] max-h-screen m-auto bg-white flex flex-col overflow-hidden select-none"
  >
    <!-- ====== COLUMN BORDERS (FULL HEIGHT OVERLAY) ====== -->
    <div
      id="column-borders"
      class="absolute inset-0 px-5 flex flex-row gap-2.5 pointer-events-none z-10 transition-opacity duration-300"
      :class="{ 'opacity-0': !wall.hasAnyActive, 'opacity-100': wall.hasAnyActive }"
    >
      <div
        v-for="col in WALL_CONFIG.columns"
        :key="`border-${col.id}`"
        class="flex-1 border-r border-dashed border-red-500/25 first:border-l"
        :data-col="col.id"
      />
    </div>

    <!-- ====== ROW 1: ZONA ATAS (BRANDING / HEADER) ====== -->
    <div id="zone-top" class="w-full h-[35%] relative flex items-center justify-center overflow-hidden shrink-0">
      <!-- Default branding (shown when all columns are idle) -->
      <div
        id="branding-default"
        class="w-full h-full flex flex-col items-center justify-center text-center transition-all duration-300"
        :class="{ 'hidden opacity-0': wall.hasAnyActive }"
      >
        <div>
          <h1 class="text-3xl lg:text-4xl italic tracking-[0.14em] text-neutral-800 uppercase font-normal">
            ALTAMA
          </h1>
          <p class="text-xs md:text-sm tracking-[0.08em] text-neutral-500 italic mt-1 font-normal">
            SURPASSING HORIZONS, ELEVATING EXCELLENCE
          </p>
        </div>
      </div>

      <!-- Content headers (shown when at least one column is active) -->
      <div
        id="content-headers"
        class="w-full h-full flex flex-row px-5 pb-3 gap-2.5"
        :class="{ hidden: !wall.hasAnyActive }"
      >
        <div
          v-for="col in WALL_CONFIG.columns"
          :key="`header-${col.id}`"
          class="flex-1 flex flex-col justify-center items-center text-center px-2 py-3 min-w-0 overflow-hidden transition-all duration-300"
          :data-col="col.id"
          :class="{
            'hidden opacity-0': wall.getColumnState(col.id) !== 'active',
            'flex opacity-100': wall.getColumnState(col.id) === 'active',
          }"
        >
          <h2 class="text-base md:text-lg lg:text-xl font-black text-neutral-800 uppercase mb-1.5 tracking-wide leading-tight">
            {{ wall.getHeaderTitle(col.id) }}
          </h2>
          <p class="text-[11px] md:text-xs text-neutral-700 leading-relaxed max-w-prose">
            {{ wall.getHeaderDesc(col.id) }}
          </p>
        </div>
      </div>
    </div>

    <!-- ====== ROW 2: ZONA TENGAH (INTERACTIVE BUTTONS) ====== -->
    <div id="zone-middle" class="w-full h-[40%] flex flex-row items-stretch px-5 gap-2.5 shrink-0">
      <div
        v-for="col in WALL_CONFIG.columns"
        :key="`col-${col.id}`"
        class="flex-1 flex flex-col relative min-w-0"
        :data-col="col.id"
      >
        <!-- Per-column independent language switcher -->
        <div
          class="flex items-center justify-center gap-2 mb-2 px-2.5 py-1 bg-neutral-900/80 border border-white/10 rounded-full backdrop-blur-md z-10 shrink-0 self-center"
          role="group"
          :aria-label="`Language switcher for column ${col.id}`"
        >
          <button
            v-for="loc in WALL_LOCALES"
            :key="loc"
            type="button"
            class="bg-transparent border border-transparent rounded px-1 py-0.5 cursor-pointer opacity-50 hover:opacity-100 hover:scale-110 transition-all duration-150 flex items-center justify-center leading-none"
            :class="{ '!opacity-100 !border-emerald-500 scale-105 shadow-[0_0_8px_rgba(16,185,129,0.7)]': wall.getColumnLocale(col.id) === loc }"
            :aria-label="`Column ${col.id} language ${loc}`"
            @click.stop="wall.setColumnLocale(col.id, loc)"
          >
            <img :src="getFlagSrc(loc)" :alt="loc" class="w-[20px] h-[13px] object-cover rounded-[2px] pointer-events-none block shadow-xs">
          </button>
        </div>

        <!-- Main Button (Idle State) -->
        <div class="flex-1 flex flex-col" :class="{ hidden: wall.getColumnState(col.id) !== 'idle' }">
          <button
            v-hold="() => wall.onMainButtonClick(col.id)"
            class="laser-target idle-breathe flex-1 flex flex-col items-center justify-center gap-1.5 bg-[#d5d5d5] hover:bg-[#c8c8c8] active:bg-[#bababa] border border-[#c0c0c0] hover:border-emerald-500/50 rounded-[10px] text-neutral-800 font-bold uppercase tracking-wider text-center p-3 cursor-pointer select-none relative transition-all duration-150"
            :data-category="col.key"
            :data-col="col.id"
          >
            <!-- Column Number Badge -->
            <div class="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-600 flex items-center justify-center mb-1 shrink-0 transition-transform duration-200">
              <span class="text-sm font-extrabold leading-none">{{ col.id }}</span>
            </div>

            <!-- Button Label (Reactively localized) -->
            <span class="text-sm md:text-base font-bold leading-tight" v-html="wall.getColumnLabelHtml(col.id)" />

            <!-- Interactive Hold Indicator with Hand Icon -->
            <div class="inline-flex items-center justify-center gap-1.5 mt-2 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full pointer-events-none">
              <svg
                class="w-4 h-4 text-emerald-600 shrink-0 animate-hand-press"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2" />
                <path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2" />
                <path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8" />
                <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
              </svg>
              <span class="text-[10px] md:text-[11px] font-extrabold tracking-wider text-neutral-800 uppercase">{{ getHoldCueText(col.id) }}</span>
            </div>
          </button>
        </div>

        <!-- Submenu Group (Expandable columns in Submenu State) -->
        <div
          v-if="col.type === 'expandable'"
          class="flex-1 flex flex-col relative bg-[#d5d5d5] border border-emerald-500/40 rounded-[10px] overflow-hidden transition-all duration-200"
          :class="{
            hidden: wall.getColumnState(col.id) !== 'submenu',
            flex: wall.getColumnState(col.id) === 'submenu',
          }"
          :data-col="col.id"
        >
          <div class="flex items-center justify-between px-3 py-1.5 bg-black/10 border-b border-black/5 shrink-0">
            <span class="text-xs font-black text-emerald-700 uppercase tracking-wider select-none">{{ wall.getColumnLabel(col.id) }}</span>
            <button
              type="button"
              class="w-6 h-6 rounded-full bg-black/10 hover:bg-red-500/20 hover:border-red-500/40 border border-black/15 text-neutral-600 hover:text-red-600 text-xs font-bold flex items-center justify-center cursor-pointer transition-all duration-150"
              :title="getBackLabel(col.id)"
              :aria-label="getBackLabel(col.id)"
              @click.stop="wall.setColumnState(col.id, 'idle')"
            >
              ✕
            </button>
          </div>
          <button
            v-for="sub in col.subItems"
            :key="sub.key"
            v-hold="() => wall.onSubButtonClick(col.id, sub.key)"
            class="laser-target flex-1 flex flex-col items-center justify-center gap-1 bg-transparent hover:bg-emerald-500/15 active:bg-emerald-500/25 border-t border-black/10 text-neutral-800 text-xs font-bold uppercase tracking-wider text-center p-2 cursor-pointer select-none relative transition-all duration-150 first:border-t-0"
            :class="{ '!bg-emerald-500/20 !text-emerald-800 font-extrabold': wall.getActiveSubItem(col.id) === sub.key }"
            :data-sub="sub.key"
            :data-col="col.id"
          >
            <span class="text-xs font-bold leading-tight" v-html="wall.getSubItemLabelHtml(col.id, sub.key)" />
            <div class="inline-flex items-center justify-center gap-1 mt-0.5 opacity-70">
              <svg
                class="w-3 h-3 text-emerald-600 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2" />
                <path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2" />
                <path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8" />
                <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
              </svg>
              <span class="text-[9px] font-bold tracking-wider text-neutral-700 uppercase">{{ getHoldCueText(col.id) }}</span>
            </div>
          </button>
        </div>

        <!-- Active Content / Carousel (Active State) -->
        <div
          class="flex-1 flex flex-col overflow-hidden"
          :class="{
            hidden: wall.getColumnState(col.id) !== 'active',
            flex: wall.getColumnState(col.id) === 'active',
          }"
          :data-col="col.id"
        >
          <div class="flex items-center justify-between px-1 pb-1 shrink-0">
            <span class="text-xs font-black text-neutral-800 uppercase tracking-wider text-left">{{ wall.getActiveSubItemLabel(col.id) }}</span>
            <button
              type="button"
              class="w-6 h-6 rounded-full bg-black/10 hover:bg-red-500/20 hover:border-red-500/40 border border-black/15 text-neutral-600 hover:text-red-600 text-xs font-bold flex items-center justify-center cursor-pointer transition-all duration-150"
              :title="getBackLabel(col.id)"
              :aria-label="getBackLabel(col.id)"
              @click.stop="col.type === 'expandable' ? wall.setColumnState(col.id, 'submenu') : wall.setColumnState(col.id, 'idle')"
            >
              ✕
            </button>
          </div>
          <div class="flex-1 flex flex-col bg-[#2d6a4f] rounded-[10px] overflow-hidden min-h-0 relative" :data-col="col.id">
            <div class="flex-1 relative overflow-hidden min-h-0">
              <div
                v-for="slideIdx in col.slides"
                :key="`slide-${slideIdx}`"
                class="absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none opacity-0"
                :class="{ '!opacity-100 !pointer-events-auto': wall.getCarouselIndex(col.id) === slideIdx - 1 }"
              >
                <div class="w-[85%] h-[75%] flex flex-col items-center justify-center bg-white/10 border-2 border-dashed border-white/25 rounded-lg gap-2 text-white/80">
                  <svg viewBox="0 0 100 80" class="w-9 h-7 text-white/50">
                    <polygon points="50,15 85,65 15,65" fill="currentColor" />
                  </svg>
                  <span class="text-xs uppercase tracking-wider text-white/85 font-bold">{{ getSlidePlaceholderText(col.id, slideIdx) }}</span>
                </div>
              </div>
            </div>
            <div class="flex flex-row items-center justify-between px-4 py-2 shrink-0">
              <button
                class="w-9 h-9 flex items-center justify-center bg-white/15 hover:bg-white/25 border border-white/30 rounded-md text-white text-base font-bold cursor-pointer select-none transition-all duration-150 active:scale-95"
                :aria-label="getPrevLabel(col.id)"
                @click.stop="wall.navigateCarousel(col.id, -1, col.slides)"
              >
                ←
              </button>
              <div class="text-white/85 text-xs font-bold tracking-widest">
                {{ String(wall.getCarouselIndex(col.id) + 1).padStart(2, '0') }} / {{ String(col.slides).padStart(2, '0') }}
              </div>
              <button
                class="w-9 h-9 flex items-center justify-center bg-white/15 hover:bg-white/25 border border-white/30 rounded-md text-white text-base font-bold cursor-pointer select-none transition-all duration-150 active:scale-95"
                :aria-label="getNextLabel(col.id)"
                @click.stop="wall.navigateCarousel(col.id, 1, col.slides)"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ====== ROW 3: ZONA BAWAH ====== -->
    <div id="zone-bottom" class="w-full flex-1 flex flex-col items-center justify-end pb-3 overflow-hidden">
      <div
        id="bottom-descriptions"
        class="w-full flex flex-row px-5 pt-2 gap-2.5 shrink-0"
        :class="{ hidden: !wall.hasAnyActive }"
      >
        <div
          v-for="col in WALL_CONFIG.columns"
          :key="`bottom-${col.id}`"
          class="flex-1 flex flex-col justify-start p-2 min-w-0 overflow-hidden"
          :data-col="col.id"
          :class="{
            'hidden opacity-0': wall.getColumnState(col.id) !== 'active',
            'flex opacity-100': wall.getColumnState(col.id) === 'active',
          }"
        >
          <h4 class="text-xs font-bold uppercase mb-1 tracking-wide text-neutral-800" :data-col="col.id">
            {{ wall.getBottomTitle(col.id) }}
          </h4>
          <p class="text-xs text-neutral-500 leading-normal">
            {{ wall.getBottomDesc(col.id) }}
          </p>
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
