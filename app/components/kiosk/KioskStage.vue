<script setup lang="ts">
import type { ColumnId, WallAction } from '../../../shared/wall';
import type { SensorMessage } from '~/types/sensor';
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
import KioskBackground from '~/components/kiosk/KioskBackground.vue';
import KioskStatus from '~/components/kiosk/KioskStatus.vue';
import KioskTouchDots from '~/components/kiosk/KioskTouchDots.vue';
import WallColumn from '~/components/wall/WallColumn.vue';
import { useSensorSocket } from '~/composables/useSensorSocket';
import { useStackedLayout } from '~/composables/useStackedLayout';
import { useTouchHints } from '~/composables/useTouchHints';
import { useWallController } from '~/composables/useWallController';
import { getColumnLayout, installationLayout } from '~/data/installation-layout';
import { getColumnConfig, getColumnPages, WALL_CONFIG } from '~/data/wall-config';
import { STAGE_MEDIA } from '~/data/wall-media';
import { useSettingsStore } from '~/stores/settings';
import { useSystemStore } from '~/stores/system';
import { useWallStore } from '~/stores/wall';
import { isVideoSrc } from '~/utils/media';
import { HOLD_GROUP_BY_ACTION } from '../../../shared/hold-settings';
import { columnOffsetY, languageGeometry } from '../../../shared/language-bar';
import { COLUMN_IDS } from '../../../shared/wall';
import { autoPageActive, closeButtonOptions } from '../../../shared/wall-settings';

const wall = useWallStore();
const system = useSystemStore();
const settings = useSettingsStore();
const controls = useWallController(wall, {
  resetDelayMs: () => settings.wall.resetSeconds * 1000,
  autoSlideMs: () => settings.wall.showArrows ? 0 : settings.wall.autoSlideSeconds * 1000,
  autoPageMs: () => autoPageActive(settings.wall) ? settings.wall.autoPageSeconds * 1000 : 0,
  // Video slides play to their end (client request); images use the interval.
  slidePlaysToEnd: (id) => {
    const snapshot = wall.columns[id];
    return isVideoSrc(getColumnPages(getColumnConfig(id), snapshot.subItem, settings.wall.scrollText)[snapshot.page]?.photos[snapshot.photo]?.src);
  },
  // Text that rotates in parts (WallPageCopy) shows every part before an automatic page change.
  pageMinMs: (id) => {
    const snapshot = wall.columns[id];
    const copy = getColumnPages(getColumnConfig(id), snapshot.subItem, settings.wall.scrollText)[snapshot.page]?.i18n[snapshot.locale];
    const parts = copy?.parts?.length ?? 0;
    return parts > 1 ? parts * (copy?.partSeconds ?? 10) * 1000 : 0;
  },
});
const runtimeConfig = useRuntimeConfig();
// Idle "press me" cue, one card or tile at a time across the wall; a touch silences that column.
const touchHints = useTouchHints({
  targets: (id) => {
    if (wall.getColumnState(id) !== 'idle')
      return [];
    const geometry = getColumnLayout(id);
    return geometry.main ? ['main'] : (geometry.subItems ?? []).map(tile => tile.key);
  },
});
function onActivity(id: ColumnId) {
  touchHints.activity(id);
  controls.touchColumn(id);
}
function hintKey(id: ColumnId) {
  return touchHints.hint.value?.columnId === id ? touchHints.hint.value.key : null;
}
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

// Dashboard font sizes (logical px) and title weight, read by the wall components as CSS variables.
const fontVars = computed(() => ({
  '--fs-title': settings.fonts.titleSize,
  '--fw-title': settings.fonts.titleWeight,
  '--fs-subitem': settings.fonts.subItemSize,
  '--fs-caption': settings.fonts.captionSize,
  '--fs-tab': settings.fonts.tabSize,
}));

// Phones/tablets: each column is drawn in its own box with a uniform scale (container width),
// showing only the logical rows its idle frame or open layout uses.
function stackedWindow(id: ColumnId) {
  if (wall.getColumnState(id) === 'idle') {
    const extend = languageGeometry(getColumnLayout(id), settings.wall.languageBar).extend;
    return { y: stackedView.idle.y, height: stackedView.idle.height + extend };
  }
  return getColumnConfig(id).type === 'expandable' ? stackedView.open : stackedView.openSingle;
}

// Open cards grow with their content, so a stacked box also grows to the card's bottom.
const cardBottoms = reactive<Partial<Record<ColumnId, number>>>({});

function stackedBox(id: ColumnId) {
  const view = stackedWindow(id);
  const bottom = wall.getColumnState(id) === 'idle' ? 0 : (cardBottoms[id] || 0) + 14;
  const height = Math.max(view.height, bottom - view.y);
  return {
    '--wall-x': `calc(100cqw / ${layout.frame.columnWidth + stackedView.padX * 2})`,
    '--wall-y': 'var(--wall-x)',
    '--wall-u': 'var(--wall-x)',
    'height': `calc(${height} * var(--wall-x))`,
  };
}

function stackedOrigin(id: ColumnId) {
  const view = stackedWindow(id);
  return { x: getColumnLayout(id).section.x - stackedView.padX, y: view.y };
}
// The large idle logo overlaps the open titles and rails of columns 3/4, so it shrinks only while one of them is open.
const compactLogo = computed(() => wall.getColumnState(3) !== 'idle' || wall.getColumnState(4) !== 'idle');
const logoBox = computed(() => compactLogo.value ? layout.visual.logo.compact : layout.visual.logo.idle);

// Calibration overlay: the dashboard switch, or `?dots=1` in the URL (handy where the wall runs in
// a browser without the dashboard's storage, e.g. a TouchDesigner Web Render TOP).
const route = useRoute();
const showTouchDots = computed(() => settings.wall.showTouchDots || route.query.dots === '1');
const touchDots = ref<InstanceType<typeof KioskTouchDots> | null>(null);

/** The wall button of an action (for a delayed press), or null when it is not on screen. */
function actionButton(action: WallAction): HTMLElement | null {
  const column = document.querySelector(`section[data-col="${action.columnId}"]`);
  const extra = action.type === 'language'
    ? `[data-locale="${action.locale}"]`
    : action.type === 'subItem' ? `[data-sub-item="${action.subItemId}"]` : action.type === 'page' ? `[data-page="${action.page}"]` : '';
  return column?.querySelector<HTMLElement>(`[data-sensor-action="${action.type}"]${extra}`) ?? null;
}

function handleSensorMessage(message: SensorMessage) {
  if (message.type !== 'input')
    return;
  touchDots.value?.addSensor(message.x, message.y);
  // Delay mode: the button plays its hold animation and activates itself (through dispatch).
  const group = HOLD_GROUP_BY_ACTION[message.action.type];
  const button = group && settings.holdRule(group).mode === 'delay' ? actionButton(message.action) : null;
  if (button) {
    controls.touchColumn(message.action.columnId);
    button.dispatchEvent(new CustomEvent('wall:press'));
    return;
  }
  controls.dispatch(message.action);
}

const sensorSocket = useSensorSocket({
  enabled: String(runtimeConfig.public.sensorEnabled).toLowerCase() === 'true',
  url: String(runtimeConfig.public.sensorWsUrl || ''),
  expectedLayoutVersion: layout.layoutVersion,
  onMessage: handleSensorMessage,
  getColumns: () => wall.publishedColumns,
  getHold: () => settings.hold,
  getCardOffsetY: () => settings.wall.cardOffsetY,
  getShowClose: () => settings.wall.showClose,
  getShowArrows: () => settings.wall.showArrows,
  getShowPages: () => settings.wall.showPages,
  getLanguageBar: () => settings.wall.languageBar,
  getClose: () => closeButtonOptions(settings.wall),
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

// Visitors must never see the browser's right-click / long-press menu (Reload, Inspect, Save
// image…) or drag images off the wall. Only the wall page does this; the dashboard stays normal.
function blockBrowserUi(event: Event) {
  event.preventDefault();
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyboard);
  window.addEventListener('contextmenu', blockBrowserUi);
  window.addEventListener('dragstart', blockBrowserUi);
  sensorSocket.start();
});
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyboard);
  window.removeEventListener('contextmenu', blockBrowserUi);
  window.removeEventListener('dragstart', blockBrowserUi);
  sensorSocket.stop();
});
</script>

<template>
  <main
    id="wall-container" class="relative isolate w-screen h-dvh bg-wall-night text-wall-ink select-none font-sans"
    :class="stacked ? 'overflow-y-auto overscroll-contain touch-pan-y' : 'overflow-hidden touch-none'"
    :style="[stacked ? {} : wallStyle, fontVars]" :data-layout="stacked ? 'stacked' : 'wall'"
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
        :column="column" :snapshot="wall.columns[column.id]" :copy="wall.getColumnCopy(column.id)" :offset-y="columnOffsetY(settings.wall.cardOffsetY, settings.wall.languageBar)"
        :hint-key="hintKey(column.id)" @action="dispatch" @activity="onActivity" @slide-ended="controls.mediaEnded"
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
              :hint-key="hintKey(column.id)" @action="dispatch" @activity="onActivity" @slide-ended="controls.mediaEnded" @card-bottom="cardBottoms[column.id] = $event"
            />
          </div>
        </div>
      </div>
    </div>

    <KioskTouchDots v-if="showTouchDots" ref="touchDots" :wall-layout="!stacked" :duration-ms="settings.wall.touchDotSeconds * 1000" />

    <KioskStatus
      v-if="showDiagnostics" :socket-status="system.socketStatus" :sensor-ready="system.sensorReady"
      :calibration-ready="system.calibrationReady" :error="system.lastError"
    />
  </main>
</template>
