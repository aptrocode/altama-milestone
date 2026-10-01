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
  if (locale === 'zh-Hans')
    return '长按';
  return 'HOLD';
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
          <h2 class="text-base md:text-lg lg:text-xl font-black text-emerald-800 uppercase mb-1.5 tracking-wide leading-tight">
            {{ wall.getHeaderTitle(col.id) }}
          </h2>
          <p class="text-[11px] md:text-xs text-neutral-600 font-medium leading-relaxed max-w-prose">
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
            class="laser-target idle-breathe flex-1 flex flex-col items-center justify-center gap-1.5 bg-gradient-to-b from-white via-slate-50 to-neutral-100 hover:from-white hover:to-emerald-50/50 active:from-neutral-100 active:to-neutral-200 border border-neutral-300/80 hover:border-emerald-500/60 rounded-xl text-neutral-900 font-extrabold uppercase tracking-wider text-center p-3 cursor-pointer select-none relative transition-all duration-150 shadow-xs hover:shadow-md"
            :data-category="col.key"
            :data-col="col.id"
          >
            <!-- Column Number Badge -->
            <div class="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-1 shrink-0 shadow-xs ring-2 ring-emerald-600/20 transition-transform duration-200">
              <span class="text-sm font-black leading-none">{{ col.id }}</span>
            </div>

            <!-- Button Label (Reactively localized) -->
            <span class="text-sm md:text-base font-black leading-tight text-neutral-900 tracking-wide" v-html="wall.getColumnLabelHtml(col.id)" />

            <!-- Interactive Hold Indicator with Hand Icon -->
            <div class="inline-flex items-center justify-center gap-1.5 mt-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full pointer-events-none transition-colors">
              <svg
                class="w-3.5 h-3.5 text-emerald-700 shrink-0 animate-hand-press"
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
              <span class="text-[10px] md:text-[11px] font-black tracking-widest text-emerald-800 uppercase">{{ getHoldCueText(col.id) }}</span>
            </div>
          </button>
        </div>

        <!-- Submenu Group (Expandable columns in Submenu State) -->
        <div
          v-if="col.type === 'expandable'"
          class="flex-1 flex flex-col relative bg-white border-2 border-emerald-600/30 rounded-xl overflow-hidden shadow-xs transition-all duration-200"
          :class="{
            hidden: wall.getColumnState(col.id) !== 'submenu',
            flex: wall.getColumnState(col.id) === 'submenu',
          }"
          :data-col="col.id"
        >
          <div class="flex items-center justify-between px-3 py-1.5 bg-emerald-800 border-b border-emerald-900/30 shrink-0">
            <span class="text-xs font-black text-white uppercase tracking-wider select-none">{{ wall.getColumnLabel(col.id) }}</span>
            <button
              type="button"
              class="w-6 h-6 rounded-full bg-white/20 hover:bg-red-500 hover:text-white border border-white/25 text-white text-xs font-bold flex items-center justify-center cursor-pointer transition-all duration-150"
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
            class="laser-target flex-1 flex flex-col items-center justify-center gap-1 bg-white hover:bg-emerald-50/80 active:bg-emerald-100/70 border-t border-neutral-200 text-neutral-900 text-xs font-bold uppercase tracking-wider text-center p-2.5 cursor-pointer select-none relative transition-all duration-150 first:border-t-0"
            :class="{ '!bg-emerald-700 !text-white font-black': wall.getActiveSubItem(col.id) === sub.key }"
            :data-sub="sub.key"
            :data-col="col.id"
          >
            <span class="text-xs font-black leading-tight" v-html="wall.getSubItemLabelHtml(col.id, sub.key)" />
            <div
              class="inline-flex items-center justify-center gap-1 mt-0.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 transition-colors"
              :class="{ '!bg-emerald-800 !border-emerald-600 !text-emerald-100': wall.getActiveSubItem(col.id) === sub.key }"
            >
              <svg
                class="w-3 h-3 shrink-0"
                :class="wall.getActiveSubItem(col.id) === sub.key ? 'text-white' : 'text-emerald-700'"
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
              <span class="text-[9px] font-black tracking-wider uppercase">{{ getHoldCueText(col.id) }}</span>
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
            <span class="text-xs font-black text-emerald-900 uppercase tracking-wider text-left">{{ wall.getActiveSubItemLabel(col.id) }}</span>
            <button
              type="button"
              class="w-6 h-6 rounded-full bg-neutral-200 hover:bg-red-500 hover:text-white border border-neutral-300 text-neutral-700 text-xs font-bold flex items-center justify-center cursor-pointer transition-all duration-150"
              :title="getBackLabel(col.id)"
              :aria-label="getBackLabel(col.id)"
              @click.stop="col.type === 'expandable' ? wall.setColumnState(col.id, 'submenu') : wall.setColumnState(col.id, 'idle')"
            >
              ✕
            </button>
          </div>
          <div class="flex-1 flex flex-col bg-gradient-to-b from-[#1b4d3e] to-[#12362b] border border-emerald-700/60 rounded-xl overflow-hidden min-h-0 relative shadow-sm" :data-col="col.id">
            <div class="flex-1 relative overflow-hidden min-h-0">
              <div
                v-for="slideIdx in col.slides"
                :key="`slide-${slideIdx}`"
                class="absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none opacity-0"
                :class="{ '!opacity-100 !pointer-events-auto': wall.getCarouselIndex(col.id) === slideIdx - 1 }"
              >
                <div class="w-[85%] h-[75%] flex flex-col items-center justify-center bg-black/25 border-2 border-dashed border-white/25 rounded-lg gap-2 text-white/90 shadow-inner">
                  <svg viewBox="0 0 100 80" class="w-9 h-7 text-white/50">
                    <polygon points="50,15 85,65 15,65" fill="currentColor" />
                  </svg>
                  <span class="text-xs uppercase tracking-wider text-white/90 font-bold">{{ getSlidePlaceholderText(col.id, slideIdx) }}</span>
                </div>
              </div>
            </div>
            <div class="flex flex-row items-center justify-between px-4 py-2 shrink-0">
              <button
                class="w-9 h-9 flex items-center justify-center p-0 leading-none shrink-0 bg-white/20 hover:bg-white/30 border border-white/40 rounded-lg text-white cursor-pointer select-none transition-all duration-150 active:scale-95 shadow-xs"
                :aria-label="getPrevLabel(col.id)"
                @click.stop="wall.navigateCarousel(col.id, -1, col.slides)"
              >
                <svg
                  class="w-5 h-5 text-white shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <div class="text-white text-xs font-black tracking-widest select-none bg-black/20 px-2.5 py-1 rounded-full border border-white/10">
                {{ String(wall.getCarouselIndex(col.id) + 1).padStart(2, '0') }} / {{ String(col.slides).padStart(2, '0') }}
              </div>
              <button
                class="w-9 h-9 flex items-center justify-center p-0 leading-none shrink-0 bg-white/20 hover:bg-white/30 border border-white/40 rounded-lg text-white cursor-pointer select-none transition-all duration-150 active:scale-95 shadow-xs"
                :aria-label="getNextLabel(col.id)"
                @click.stop="wall.navigateCarousel(col.id, 1, col.slides)"
              >
                <svg
                  class="w-5 h-5 text-white shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
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
          <h4 class="text-xs font-black uppercase mb-1 tracking-wide text-emerald-800" :data-col="col.id">
            {{ wall.getBottomTitle(col.id) }}
          </h4>
          <p class="text-xs text-neutral-600 leading-normal font-normal">
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

<style scoped>
@property --hold-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

/* Neon laser outline tracer on hold */
.laser-target::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 12px;
  background: conic-gradient(
    from 0deg,
    rgba(5, 150, 105, 0.3) 0deg,
    #059669 0deg,
    #10b981 calc(var(--hold-angle, 0deg) - 20deg),
    #6ee7b7 calc(var(--hold-angle, 0deg) - 6deg),
    #ffffff var(--hold-angle, 0deg),
    transparent var(--hold-angle, 0deg)
  );
  padding: 3.5px;
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: exclude;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
  filter:
    drop-shadow(0 0 2px #ffffff)
    drop-shadow(0 0 6px #10b981)
    drop-shadow(0 0 14px rgba(16, 185, 129, 0.8));
}

.laser-target.holding {
  border-color: rgba(16, 185, 129, 0.8);
  transform: scale(0.985);
}

.laser-target.holding::after {
  opacity: 1;
  animation: holdBorderFill 1s linear forwards;
}

.laser-target.hold-complete {
  animation: holdSuccessBurst 0.35s ease-out;
}

.laser-target.hold-complete::after {
  opacity: 1;
  --hold-angle: 360deg;
  background: conic-gradient(
    from 0deg,
    #10b981 0deg,
    #34d399 180deg,
    #ffffff 360deg
  );
  filter:
    drop-shadow(0 0 4px #ffffff)
    drop-shadow(0 0 12px #34d399)
    drop-shadow(0 0 24px rgba(16, 185, 129, 0.9));
}

@keyframes holdBorderFill {
  from { --hold-angle: 0deg; }
  to   { --hold-angle: 360deg; }
}

@keyframes holdSuccessBurst {
  0% {
    transform: scale(0.975);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}

/* Subtle Idle Breathing Border */
.idle-breathe {
  animation: idleBreathe 3.5s ease-in-out infinite alternate;
}

@keyframes idleBreathe {
  0% {
    border-color: rgba(212, 212, 212, 0.8);
  }
  100% {
    border-color: rgba(16, 185, 129, 0.6);
  }
}

/* Hand hold gesture animation */
.animate-hand-press {
  animation: handHoldHint 2s ease-in-out infinite;
}

@keyframes handHoldHint {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px) scale(1.08);
  }
}
</style>
