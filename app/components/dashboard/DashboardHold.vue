<script setup lang="ts">
import type { HoldGroup, HoldSettings } from '../../../shared/hold-settings';
import { computed, ref, watch } from 'vue';
import DashboardFormActions from '~/components/dashboard/DashboardFormActions.vue';
import { useSettingsStore } from '~/stores/settings';
import { DEFAULT_HOLD_SETTINGS, HOLD_GROUPS, HOLD_SECONDS, normalizeHoldSettings } from '../../../shared/hold-settings';

const GROUP_LABEL: Record<HoldGroup, { title: string; hint: string }> = {
  card: { title: 'Card section', hint: 'Kartu & tile' },
  page: { title: 'Button page', hint: '1960/1996, PAGE 1/2' },
  slider: { title: 'Button slider', hint: 'Panah foto' },
  language: { title: 'Bahasa', hint: 'Bendera ID / EN / 中文' },
  back: { title: 'Tombol close', hint: 'Tombol ✕ di card' },
};

const settings = useSettingsStore();
const copy = (value: HoldSettings): HoldSettings => normalizeHoldSettings(JSON.parse(JSON.stringify(value)));
const draft = ref<HoldSettings>(copy(settings.hold));
const status = ref('');

const dirty = computed(() => JSON.stringify(normalizeHoldSettings(draft.value)) !== JSON.stringify(settings.hold));

// Another tab (or an import) may change the saved settings; follow them unless the operator is editing.
watch(() => settings.hold, (next) => {
  if (!dirty.value)
    draft.value = copy(next);
}, { deep: true });

function save() {
  settings.setHold(draft.value);
  draft.value = copy(settings.hold);
  status.value = 'Tersimpan';
}

function restoreDefaults() {
  draft.value = copy(DEFAULT_HOLD_SETTINGS);
  status.value = 'Default dimuat, klik Simpan';
}

function setSeconds(group: HoldGroup, value: string) {
  const seconds = Number.parseFloat(value);
  if (Number.isFinite(seconds))
    draft.value[group].seconds = seconds;
}
</script>

<template>
  <section aria-label="Hold">
    <ul class="divide-y divide-white/10 rounded-xl bg-white/5 ring-1 ring-white/10">
      <li v-for="group in HOLD_GROUPS" :key="group" class="flex items-center gap-4 px-4 py-4" :data-hold-setting="group">
        <div class="min-w-0 flex-1">
          <p class="font-bold text-white">
            {{ GROUP_LABEL[group].title }}
          </p>
          <p class="text-sm text-sky-100/60">
            {{ GROUP_LABEL[group].hint }}
          </p>
        </div>
        <div class="flex items-center gap-1.5" :class="draft[group].enabled ? '' : 'opacity-30'">
          <input
            type="number" inputmode="decimal"
            class="w-16 rounded-md bg-white/10 px-2 py-1.5 text-right font-bold text-white ring-1 ring-white/15 focus:outline-none focus:ring-2 focus:ring-wall-glow"
            :aria-label="`Detik hold ${GROUP_LABEL[group].title}`"
            :min="HOLD_SECONDS.min" :max="HOLD_SECONDS.max" :step="HOLD_SECONDS.step" :value="draft[group].seconds"
            :disabled="!draft[group].enabled" @change="setSeconds(group, ($event.target as HTMLInputElement).value)"
          >
          <span class="text-sm text-sky-100/60">s</span>
        </div>
        <button
          type="button" role="switch" :aria-checked="draft[group].enabled" :aria-label="`Hold ${GROUP_LABEL[group].title}`"
          class="relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors"
          :class="draft[group].enabled ? 'bg-emerald-400' : 'bg-white/20'"
          @click="draft[group].enabled = !draft[group].enabled"
        >
          <span class="inline-block size-5 rounded-full bg-white shadow transition-transform" :class="draft[group].enabled ? 'translate-x-6' : 'translate-x-1'" />
        </button>
      </li>
    </ul>

    <DashboardFormActions :dirty="dirty" :status="status" @save="save" @defaults="restoreDefaults" />
  </section>
</template>
