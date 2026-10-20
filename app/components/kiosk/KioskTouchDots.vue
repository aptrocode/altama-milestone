<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive } from 'vue';
import { installationLayout } from '~/data/installation-layout';

/**
 * Calibration overlay (dashboard "Titik sentuh" or `?dots=1`): where each pointer pressed (blue),
 * where it released (red, with a line when it drifted), and where Sensor Service inputs landed
 * (green), with logical wall coordinates on the LED layout. Purely visual: it never takes input.
 */
const props = defineProps<{
  wallLayout: boolean;
  /** How long a dot stays after its release or sensor input (dashboard "Durasi titik"). */
  durationMs: number;
}>();

interface Point { x: number; y: number }
interface Mark { key: number; pointerId?: number; kind: 'pointer' | 'sensor'; down: Point; up?: Point }

const canvas = installationLayout.canvas;
const marks = reactive<Mark[]>([]);
const timers = new Set<ReturnType<typeof setTimeout>>();
let nextKey = 0;

function expire(mark: Mark, delay: number) {
  const timer = setTimeout(() => {
    timers.delete(timer);
    const index = marks.findIndex(item => item.key === mark.key);
    if (index >= 0)
      marks.splice(index, 1);
  }, delay);
  timers.add(timer);
}

/** Logical wall coordinates of a viewport point (the LED layout fills the viewport). */
function label(point: Point) {
  if (!props.wallLayout)
    return '';
  return `x ${Math.round(point.x / window.innerWidth * canvas.width)} · y ${Math.round(point.y / window.innerHeight * canvas.height)}`;
}

function onDown(event: PointerEvent) {
  const mark: Mark = { key: nextKey++, pointerId: event.pointerId, kind: 'pointer', down: { x: event.clientX, y: event.clientY } };
  marks.push(mark);
  // A press without a release (lost pointer) still disappears.
  expire(mark, props.durationMs * 4);
}

function onUp(event: PointerEvent) {
  const mark = [...marks].reverse().find(item => item.pointerId === event.pointerId && !item.up);
  if (!mark)
    return;
  mark.up = { x: event.clientX, y: event.clientY };
  expire(mark, props.durationMs);
}

/** A Sensor Service input at logical wall coordinates. */
function addSensor(x: number, y: number) {
  if (!props.wallLayout)
    return;
  const mark: Mark = { key: nextKey++, kind: 'sensor', down: { x: x / canvas.width * window.innerWidth, y: y / canvas.height * window.innerHeight } };
  marks.push(mark);
  expire(mark, props.durationMs);
}

defineExpose({ addSensor });

onMounted(() => {
  window.addEventListener('pointerdown', onDown, { capture: true, passive: true });
  window.addEventListener('pointerup', onUp, { capture: true, passive: true });
  window.addEventListener('pointercancel', onUp, { capture: true, passive: true });
});
onBeforeUnmount(() => {
  window.removeEventListener('pointerdown', onDown, { capture: true });
  window.removeEventListener('pointerup', onUp, { capture: true });
  window.removeEventListener('pointercancel', onUp, { capture: true });
  timers.forEach(clearTimeout);
  timers.clear();
});

function drifted(mark: Mark) {
  return !!mark.up && Math.hypot(mark.up.x - mark.down.x, mark.up.y - mark.down.y) > 4;
}
</script>

<template>
  <svg class="pointer-events-none fixed inset-0 z-50 size-full" aria-hidden="true" data-touch-dots>
    <g v-for="mark in marks" :key="mark.key" class="[paint-order:stroke] [stroke-linejoin:round]">
      <line
        v-if="drifted(mark)" :x1="mark.down.x" :y1="mark.down.y" :x2="mark.up!.x" :y2="mark.up!.y"
        stroke="#fde047" stroke-width="3" stroke-dasharray="6 4"
      />
      <circle
        :cx="mark.down.x" :cy="mark.down.y" r="12" stroke="white" stroke-width="3"
        :fill="mark.kind === 'sensor' ? '#4ade80' : '#38bdf8'" :data-dot="mark.kind === 'sensor' ? 'sensor' : 'down'"
      />
      <text
        :x="mark.down.x + 18" :y="mark.down.y - 14" fill="white" stroke="#020617" stroke-width="4"
        font-size="16" font-weight="700"
      >{{ label(mark.down) }}</text>
      <template v-if="mark.up">
        <circle :cx="mark.up.x" :cy="mark.up.y" r="9" fill="#f43f5e" stroke="white" stroke-width="3" data-dot="up" />
        <text
          v-if="drifted(mark)" :x="mark.up.x + 16" :y="mark.up.y + 24" fill="#fecdd3" stroke="#020617" stroke-width="4"
          font-size="14" font-weight="700"
        >{{ label(mark.up) }}</text>
      </template>
    </g>
  </svg>
</template>
