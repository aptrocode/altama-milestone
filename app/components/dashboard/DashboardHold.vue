<script setup lang="ts">
import type { HoldGroup, HoldMode } from '../../../shared/hold-settings';
import type { HelpLine } from '~/components/dashboard/DashboardSettingRow.vue';
import { computed } from 'vue';
import DashboardFormActions from '~/components/dashboard/DashboardFormActions.vue';
import DashboardSection from '~/components/dashboard/DashboardSection.vue';
import DashboardSettingRow from '~/components/dashboard/DashboardSettingRow.vue';
import { useSettingsDraft } from '~/composables/useSettingsDraft';
import { useSettingsStore } from '~/stores/settings';
import { DEFAULT_HOLD_SETTINGS, HOLD_GROUPS, HOLD_MODES, HOLD_SECONDS, normalizeHoldSettings } from '../../../shared/hold-settings';
import { arrowsShown } from '../../../shared/wall-settings';

const GROUP_LABEL: Record<HoldGroup, { title: string; hint: string }> = {
  card: { title: 'Card section', hint: 'Kartu & tile' },
  page: { title: 'Button page', hint: 'Tab PAGE 1–4' },
  slider: { title: 'Button slider', hint: 'Panah foto' },
  language: { title: 'Bahasa', hint: 'Bendera ID / EN / 中文' },
  back: { title: 'Tombol close', hint: 'Tombol ✕ di card' },
};

const settings = useSettingsStore();
// Groups whose buttons the Wall page hides are hidden here too (their values are kept).
const hiddenByWall = computed(() => ({
  page: !settings.wall.showPages,
  slider: !arrowsShown(settings.wall),
  back: !settings.wall.showClose,
}) as Partial<Record<HoldGroup, boolean>>);
const visibleGroups = computed(() => HOLD_GROUPS.filter(group => !hiddenByWall.value[group]));
const hiddenNote = computed(() => HOLD_GROUPS.filter(group => hiddenByWall.value[group]).map(group => GROUP_LABEL[group].title));
const listFormat = new Intl.ListFormat('id', { type: 'conjunction' });
const { draft, dirty, status, save, discard, restoreDefaults } = useSettingsDraft({
  saved: () => settings.hold,
  normalize: normalizeHoldSettings,
  defaults: DEFAULT_HOLD_SETTINGS,
  save: value => settings.setHold(value),
});

function setSeconds(group: HoldGroup, value: string) {
  const seconds = Number.parseFloat(value);
  if (Number.isFinite(seconds))
    draft.value = normalizeHoldSettings({ ...draft.value, [group]: { ...draft.value[group], seconds } });
}

function setMode(group: HoldGroup, mode: HoldMode) {
  draft.value = normalizeHoldSettings({ ...draft.value, [group]: { ...draft.value[group], mode } });
}

const MODE_LABEL: Record<HoldMode, string> = { tap: 'Tap', hold: 'Hold', delay: 'Tap + delay' };
const changed = (group: HoldGroup) => draft.value[group].mode !== DEFAULT_HOLD_SETTINGS[group].mode || draft.value[group].seconds !== DEFAULT_HOLD_SETTINGS[group].seconds;
const defaultLabel = (group: HoldGroup) => DEFAULT_HOLD_SETTINGS[group].mode === 'tap' ? 'Tap' : `${MODE_LABEL[DEFAULT_HOLD_SETTINGS[group].mode]} ${DEFAULT_HOLD_SETTINGS[group].seconds} s`;
function reset(group: HoldGroup) {
  draft.value = normalizeHoldSettings({ ...draft.value, [group]: DEFAULT_HOLD_SETTINGS[group] });
}

/** Tooltip shared by every row: what the three modes do. */
const HELP: HelpLine[] = [
  { term: 'Tap', text: 'Tombol langsung jalan saat ditekan biasa.' },
  { term: 'Hold', text: 'Tombol harus ditahan sekian detik; garis di tepi tombol menunjukkan progresnya. Dilepas lebih cepat = batal.' },
  { term: 'Tap + delay', text: 'Cukup ditekan sekali, lalu tombol jalan setelah sekian detik dengan animasi yang sama seperti hold. Tidak perlu ditahan; berguna untuk sensor yang posisi lepasnya sering bergeser.' },
  'Keyboard (Enter/Spasi) selalu langsung jalan.',
];
</script>

<template>
  <section aria-label="Hold" class="space-y-4">
    <DashboardSection title="Cara menekan" icon="buttons" description="Untuk setiap jenis tombol: tap biasa, harus ditahan, atau tap lalu tunggu.">
      <DashboardSettingRow
        v-for="group in visibleGroups" :key="group" :data-hold-setting="group"
        :title="GROUP_LABEL[group].title" :hint="GROUP_LABEL[group].hint" :help="HELP"
        :changed="changed(group)" :default-label="defaultLabel(group)" @reset="reset(group)"
      >
        <div class="flex flex-wrap items-center justify-end gap-3">
          <div class="flex rounded-lg bg-white/10 p-1 ring-1 ring-white/15" role="radiogroup" :aria-label="`Mode ${GROUP_LABEL[group].title}`">
            <button
              v-for="mode in HOLD_MODES" :key="mode" type="button" role="radio" :aria-checked="draft[group].mode === mode"
              class="rounded-md px-3 py-1.5 text-sm font-bold transition-colors"
              :class="draft[group].mode === mode ? 'bg-wall-glow text-[#050d4f]' : 'text-sky-100/70 hover:bg-white/10'"
              @click="setMode(group, mode)"
            >
              {{ MODE_LABEL[mode] }}
            </button>
          </div>
          <div class="flex items-center gap-1.5" :class="draft[group].mode === 'tap' ? 'opacity-30' : ''">
            <input
              type="number" inputmode="decimal"
              class="w-16 rounded-md bg-white/10 px-2 py-1.5 text-right font-bold text-white ring-1 ring-white/15 focus:outline-none focus:ring-2 focus:ring-wall-glow"
              :aria-label="`Detik ${GROUP_LABEL[group].title}`"
              :min="HOLD_SECONDS.min" :max="HOLD_SECONDS.max" :step="HOLD_SECONDS.step" :value="draft[group].seconds"
              :disabled="draft[group].mode === 'tap'" @change="setSeconds(group, ($event.target as HTMLInputElement).value)"
            >
            <span class="text-sm text-sky-100/60">s</span>
          </div>
        </div>
      </DashboardSettingRow>
    </DashboardSection>
    <p v-if="hiddenNote.length" class="px-1 text-sm text-sky-100/60" data-hold-hidden-note>
      {{ listFormat.format(hiddenNote) }} disembunyikan karena tombolnya dimatikan di
      <NuxtLink to="/dashboard/wall" class="font-bold text-white underline underline-offset-2">
        halaman Wall
      </NuxtLink>
    </p>

    <DashboardFormActions :dirty="dirty" :status="status" @save="save" @discard="discard" @defaults="restoreDefaults" />
  </section>
</template>
