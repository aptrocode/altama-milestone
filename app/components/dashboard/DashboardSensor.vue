<script setup lang="ts">
import type { SensorConfig, SensorSource } from '../../../shared/sensor-config';
import { computed, ref, watch } from 'vue';
import { useSensorAdmin } from '~/composables/useSensorAdmin';
import { installationLayout } from '~/data/installation-layout';
import { MAX_CALIBRATION_POINTS, normalizeSensorConfig, SENSOR_ADMIN_VERSION, SENSOR_CANVAS, SENSOR_SOURCES } from '../../../shared/sensor-config';

const props = defineProps<{ url: string }>();

const SOURCE_LABEL: Record<SensorSource, string> = { off: 'Off', hokuyo: 'Hokuyo', augmenta: 'Augmenta', tuio: 'TUIO' };
const field = 'w-full rounded-md bg-white/10 px-2 py-1.5 font-bold text-white ring-1 ring-white/15 focus:outline-none focus:ring-2 focus:ring-wall-glow';
const smallButton = 'rounded-md px-3 py-1.5 text-sm font-bold ring-1 ring-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40';

const admin = useSensorAdmin(props.url);
const draft = ref<SensorConfig | null>(null);
const message = ref('');

const clone = (value: SensorConfig): SensorConfig => normalizeSensorConfig(JSON.parse(JSON.stringify(value)));
const same = (a: SensorConfig | null, b: SensorConfig | null) => !!a && !!b && JSON.stringify(normalizeSensorConfig(a)) === JSON.stringify(normalizeSensorConfig(b));
const dirty = computed(() => !!draft.value && !!admin.config.value && !same(draft.value, admin.config.value));

// Follow the service (another dashboard, a restart) unless the operator is editing. Number fields use
// v-model.lazy: the 10 Hz contact preview re-renders this form, and a plain :value binding would reset
// a field while it is being typed in.
watch(admin.config, (next, previous) => {
  if (next && (!draft.value || !previous || same(draft.value, previous)))
    draft.value = clone(next);
});

watch(admin.result, (result) => {
  if (!result)
    return;
  const done: Record<string, string> = { setConfig: 'Tersimpan', captureBackground: 'Background tersimpan', clearBackground: 'Background dihapus' };
  message.value = result.ok ? done[result.request] ?? '' : result.error ?? 'Gagal';
});

const status = computed(() => admin.status.value);
const tone = computed(() => {
  const s = status.value;
  if (!admin.connected.value || !s)
    return { dot: 'bg-white/30', text: 'Service offline' };
  const name = SOURCE_LABEL[s.source];
  if (s.calibrating)
    return { dot: 'bg-amber-400', text: `${name} · kalibrasi` };
  if (!s.sensorReady)
    return { dot: 'bg-rose-500', text: `${name} · ${s.detail || 'offline'}` };
  if (!s.calibrated)
    return { dot: 'bg-amber-400', text: `${name} · belum kalibrasi` };
  if (s.source === 'off')
    return { dot: 'bg-emerald-400', text: 'OSC saja' };
  return { dot: 'bg-emerald-400', text: s.source === 'hokuyo' ? `${name} · ${s.scanRate} Hz` : `${name} · siap` };
});

// Four points always fit exactly; the error only means something from the fifth measured point on.
const calibrationText = computed(() => {
  const rms = status.value?.calibrationRmsPx;
  const measured = admin.config.value?.hokuyo.calibration.filter(point => point.sensor).length ?? 0;
  if (rms === null || rms === undefined)
    return '—';
  return measured > 4 ? `± ${rms} px` : '✓';
});

const columns = installationLayout.columns.map(column => column.card);
const nearest = computed(() => admin.sensorPoints.value[0] ?? null);

function save() {
  if (draft.value && admin.send({ version: SENSOR_ADMIN_VERSION, type: 'setConfig', config: normalizeSensorConfig(draft.value) }))
    message.value = '…';
}

function cancel() {
  if (admin.config.value)
    draft.value = clone(admin.config.value);
  message.value = '';
}

function capture(index: number) {
  const point = nearest.value;
  const target = draft.value?.hokuyo.calibration[index];
  if (point && target)
    target.sensor = { x: point.x, y: point.y };
}

function addPoint() {
  draft.value?.hokuyo.calibration.push({ wall: { x: Math.round(SENSOR_CANVAS.width / 2), y: Math.round(SENSOR_CANVAS.height / 2) }, sensor: null });
}

function toggleCalibration() {
  admin.send({ version: SENSOR_ADMIN_VERSION, type: 'calibrate', on: !status.value?.calibrating });
}

function contactColor(contact: { target: string | null; fired: boolean }) {
  return contact.fired ? '#34d399' : contact.target ? '#66ccff' : 'rgba(255,255,255,.55)';
}
</script>

<template>
  <section aria-labelledby="dashboard-sensor">
    <div class="flex items-center justify-between gap-4">
      <h2 id="dashboard-sensor" class="font-display text-2xl font-medium uppercase tracking-wide text-white">
        Sensor
      </h2>
      <p class="flex items-center gap-2 text-sm font-bold text-sky-100/80" role="status" aria-live="polite" data-sensor-status>
        <span class="size-2.5 rounded-full" :class="tone.dot" />
        {{ tone.text }}
        <span v-if="status" class="font-normal text-sky-100/50">· wall {{ status.wallClients }}</span>
      </p>
    </div>

    <p v-if="!admin.connected.value" class="mt-4 rounded-xl bg-white/5 px-4 py-4 text-sm text-sky-100/70 ring-1 ring-white/10">
      <code>bun run sensor:service</code> · {{ props.url }}
    </p>

    <template v-else-if="draft">
      <div class="mt-4 grid grid-cols-4 gap-1 rounded-xl bg-white/5 p-1 ring-1 ring-white/10" role="radiogroup" aria-label="Sumber sensor">
        <button
          v-for="source in SENSOR_SOURCES" :key="source" type="button" role="radio" :aria-checked="draft.source === source"
          class="rounded-lg py-2 text-sm font-bold transition-colors"
          :class="draft.source === source ? 'bg-wall-glow text-[#06124f]' : 'text-sky-100/80 hover:bg-white/10'"
          :data-sensor-source="source" @click="draft.source = source"
        >
          {{ SOURCE_LABEL[source] }}
        </button>
      </div>

      <div class="mt-3 space-y-3 rounded-xl bg-white/5 px-4 py-4 ring-1 ring-white/10">
        <div v-if="draft.source === 'hokuyo'" class="grid grid-cols-[1fr_6rem] gap-3">
          <label class="text-sm text-sky-100/60">IP
            <input v-model.trim="draft.hokuyo.host" :class="field" class="mt-1" spellcheck="false" data-sensor-host>
          </label>
          <label class="text-sm text-sky-100/60">Port
            <input v-model.lazy.number="draft.hokuyo.port" type="number" :class="field" class="mt-1">
          </label>
        </div>

        <div v-for="source in (['augmenta', 'tuio'] as const)" v-show="draft.source === source" :key="source" class="grid grid-cols-[6rem_1fr] items-end gap-3">
          <label class="text-sm text-sky-100/60">Port
            <input v-model.lazy.number="draft[source].port" type="number" :class="field" class="mt-1">
          </label>
          <div class="flex items-center justify-end gap-3 pb-1">
            <span class="text-sm font-bold">Invert Y</span>
            <button
              type="button" role="switch" :aria-checked="draft[source].invertY" aria-label="Invert Y"
              class="relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors"
              :class="draft[source].invertY ? 'bg-emerald-400' : 'bg-white/20'"
              @click="draft[source].invertY = !draft[source].invertY"
            >
              <span class="inline-block size-5 rounded-full bg-white shadow transition-transform" :class="draft[source].invertY ? 'translate-x-6' : 'translate-x-1'" />
            </button>
          </div>
        </div>

        <label class="grid grid-cols-[1fr_6rem] items-center gap-3 text-sm text-sky-100/60">
          OSC show control
          <input v-model.lazy.number="draft.osc.port" type="number" :class="field" aria-label="Port OSC">
        </label>
      </div>

      <div v-if="draft.source === 'hokuyo'" class="mt-3 rounded-xl bg-white/5 px-4 py-4 ring-1 ring-white/10" data-sensor-calibration>
        <div class="flex flex-wrap items-center gap-2">
          <h3 class="flex-1 font-bold text-white">
            Kalibrasi
            <span class="ml-1 text-sm font-normal text-sky-100/60">
              {{ calibrationText }}
            </span>
          </h3>
          <button
            type="button" :class="[smallButton, status?.calibrating ? 'bg-amber-400 text-[#06124f] hover:bg-amber-300' : '']"
            :aria-pressed="!!status?.calibrating" @click="toggleCalibration"
          >
            {{ status?.calibrating ? 'Selesai' : 'Mode kalibrasi' }}
          </button>
        </div>

        <ol class="mt-3 space-y-2">
          <li v-for="(point, index) in draft.hokuyo.calibration" :key="index" class="grid grid-cols-[1rem_3.75rem_3.75rem_1fr_auto_auto] items-center gap-1.5 text-sm sm:grid-cols-[1.5rem_4.5rem_4.5rem_1fr_auto_auto] sm:gap-2">
            <span class="font-bold text-wall-glow">{{ index + 1 }}</span>
            <input v-model.lazy.number="point.wall.x" type="number" :class="field" :aria-label="`Titik ${index + 1} x`">
            <input v-model.lazy.number="point.wall.y" type="number" :class="field" :aria-label="`Titik ${index + 1} y`">
            <span class="truncate text-right text-xs tabular-nums text-sky-100/70 sm:text-sm" :title="point.sensor ? 'mm' : undefined">{{ point.sensor ? `${Math.round(point.sensor.x)}, ${Math.round(point.sensor.y)}` : '—' }}</span>
            <button type="button" :class="smallButton" :disabled="!nearest" @click="capture(index)">
              Ambil
            </button>
            <button
              type="button" class="size-7 rounded-md text-sky-100/60 hover:bg-white/10 disabled:invisible" :disabled="draft.hokuyo.calibration.length <= 4"
              :aria-label="`Hapus titik ${index + 1}`" @click="draft.hokuyo.calibration.splice(index, 1)"
            >
              ✕
            </button>
          </li>
        </ol>

        <div class="mt-3 flex flex-wrap items-center gap-2">
          <button type="button" :class="smallButton" :disabled="draft.hokuyo.calibration.length >= MAX_CALIBRATION_POINTS" @click="addPoint">
            + Titik
          </button>
          <span class="flex-1 text-right text-sm text-sky-100/60">
            Background {{ status?.backgroundSteps ? `${status.backgroundSteps} step` : '—' }}
          </span>
          <button type="button" :class="smallButton" @click="admin.send({ version: SENSOR_ADMIN_VERSION, type: 'captureBackground' })">
            Ambil
          </button>
          <button type="button" :class="smallButton" :disabled="!status?.backgroundSteps" @click="admin.send({ version: SENSOR_ADMIN_VERSION, type: 'clearBackground' })">
            Hapus
          </button>
        </div>
      </div>

      <figure class="mt-3">
        <svg :viewBox="`0 0 ${SENSOR_CANVAS.width} ${SENSOR_CANVAS.height}`" class="block w-full rounded-xl bg-black/30 ring-1 ring-white/10" role="img" aria-label="Preview kontak" data-sensor-preview>
          <rect v-for="(card, index) in columns" :key="index" :x="card.x" :y="card.y" :width="card.width" :height="card.height" rx="14" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="5" />
          <g v-if="draft.source === 'hokuyo'" stroke="#fbbf24" stroke-width="5" fill="#fbbf24">
            <g v-for="(point, index) in draft.hokuyo.calibration" :key="index">
              <line :x1="point.wall.x - 30" :y1="point.wall.y" :x2="point.wall.x + 30" :y2="point.wall.y" />
              <line :x1="point.wall.x" :y1="point.wall.y - 30" :x2="point.wall.x" :y2="point.wall.y + 30" />
              <text :x="point.wall.x + 14" :y="point.wall.y - 14" font-size="44" font-weight="700" stroke="none">{{ index + 1 }}</text>
            </g>
          </g>
          <g v-for="contact in admin.contacts.value" :key="contact.id" :transform="`translate(${contact.x} ${contact.y})`">
            <circle r="30" :fill="contactColor(contact)" />
            <circle v-if="contact.target" r="52" fill="none" :stroke="contactColor(contact)" stroke-width="10" pathLength="100" :stroke-dasharray="`${contact.progress * 100} 100`" transform="rotate(-90)" />
          </g>
        </svg>
        <figcaption class="mt-1.5 flex justify-between text-xs text-sky-100/50">
          <span>{{ admin.contacts.value.length }} kontak<template v-if="draft.source === 'hokuyo'"> · {{ admin.sensorPoints.value.length }} cluster</template></span>
          <span>input {{ status?.inputs ?? 0 }}</span>
        </figcaption>
      </figure>

      <div class="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button" class="rounded-lg bg-wall-glow px-5 py-2 font-bold text-[#06124f] hover:bg-sky-200 disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="!dirty" data-sensor-save @click="save"
        >
          Simpan
        </button>
        <button type="button" class="rounded-lg px-4 py-2 font-bold ring-1 ring-white/20 hover:bg-white/10 disabled:opacity-40" :disabled="!dirty" @click="cancel">
          Batal
        </button>
      </div>
      <p class="mt-3 min-h-5 text-sm text-sky-100/70" role="status" aria-live="polite">
        {{ dirty ? 'Belum disimpan' : message }}
      </p>
    </template>
  </section>
</template>
