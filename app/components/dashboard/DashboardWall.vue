<script setup lang="ts">
import type { WallSettings } from '../../../shared/wall-settings';
import { computed, ref, watch } from 'vue';
import DashboardFormActions from '~/components/dashboard/DashboardFormActions.vue';
import { useSettingsStore } from '~/stores/settings';
import { CARD_OFFSET_Y, DEFAULT_WALL_SETTINGS, normalizeWallSettings, RESET_SECONDS } from '../../../shared/wall-settings';

const settings = useSettingsStore();
const draft = ref<WallSettings>(normalizeWallSettings(settings.wall));
const status = ref('');
const field = 'w-20 rounded-md bg-white/10 px-2 py-1.5 text-right font-bold text-white ring-1 ring-white/15 focus:outline-none focus:ring-2 focus:ring-wall-glow';

const dirty = computed(() => JSON.stringify(normalizeWallSettings(draft.value)) !== JSON.stringify(settings.wall));

// Follow changes from another tab or an import unless the operator is editing.
watch(() => settings.wall, (next) => {
  if (!dirty.value)
    draft.value = normalizeWallSettings(next);
}, { deep: true });

function save() {
  settings.setWall(draft.value);
  draft.value = normalizeWallSettings(settings.wall);
  status.value = 'Tersimpan';
}

function restoreDefaults() {
  draft.value = normalizeWallSettings(DEFAULT_WALL_SETTINGS);
  status.value = 'Default dimuat, klik Simpan';
}

function set(key: keyof WallSettings, value: string) {
  const number = Number.parseFloat(value);
  if (Number.isFinite(number))
    draft.value = normalizeWallSettings({ ...draft.value, [key]: number });
}

function nudgeOffset(delta: number) {
  draft.value = normalizeWallSettings({ ...draft.value, cardOffsetY: draft.value.cardOffsetY + delta });
}
</script>

<template>
  <section aria-label="Wall">
    <ul class="divide-y divide-white/10 rounded-xl bg-white/5 ring-1 ring-white/10">
      <li class="flex flex-wrap items-center gap-4 px-4 py-4" data-wall-setting="resetSeconds">
        <div class="min-w-0 flex-1 basis-56">
          <p class="font-bold text-white">
            Reset otomatis
          </p>
          <p class="text-sm text-sky-100/60">
            Section kembali ke awal setelah tidak disentuh (berlaku untuk semua section)
          </p>
        </div>
        <div class="flex items-center gap-1.5">
          <input
            type="number" inputmode="numeric" :class="field"
            aria-label="Detik reset otomatis" :min="RESET_SECONDS.min" :max="RESET_SECONDS.max" :step="RESET_SECONDS.step"
            :value="draft.resetSeconds" @change="set('resetSeconds', ($event.target as HTMLInputElement).value)"
          >
          <span class="text-sm text-sky-100/60">s</span>
        </div>
      </li>
      <li class="flex flex-wrap items-center gap-4 px-4 py-4" data-wall-setting="cardOffsetY">
        <div class="min-w-0 flex-1 basis-56">
          <p class="font-bold text-white">
            Posisi Y card
          </p>
          <p class="text-sm text-sky-100/60">
            Geser semua section ke atas (−) atau ke bawah (+), {{ CARD_OFFSET_Y.min }} s.d. {{ CARD_OFFSET_Y.max }} px. Area sentuh sensor ikut bergeser.
          </p>
        </div>
        <div class="flex items-center gap-1.5">
          <button type="button" class="size-8 rounded-md font-bold ring-1 ring-white/20 hover:bg-white/10" aria-label="Naikkan card 10 px" @click="nudgeOffset(-10)">
            ↑
          </button>
          <input
            type="number" inputmode="numeric" :class="field"
            aria-label="Posisi Y card dalam px" :min="CARD_OFFSET_Y.min" :max="CARD_OFFSET_Y.max" :step="CARD_OFFSET_Y.step"
            :value="draft.cardOffsetY" @change="set('cardOffsetY', ($event.target as HTMLInputElement).value)"
          >
          <button type="button" class="size-8 rounded-md font-bold ring-1 ring-white/20 hover:bg-white/10" aria-label="Turunkan card 10 px" @click="nudgeOffset(10)">
            ↓
          </button>
          <span class="text-sm text-sky-100/60">px</span>
        </div>
      </li>
    </ul>

    <DashboardFormActions :dirty="dirty" :status="status" @save="save" @defaults="restoreDefaults" />
  </section>
</template>
