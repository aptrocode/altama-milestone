<script setup lang="ts">
import type { LanguageBarMode } from '../../../shared/language-bar';
import type { WallSettings } from '../../../shared/wall-settings';
import type { HelpLine } from '~/components/dashboard/DashboardSettingRow.vue';
import { computed } from 'vue';
import DashboardFormActions from '~/components/dashboard/DashboardFormActions.vue';
import DashboardSection from '~/components/dashboard/DashboardSection.vue';
import DashboardSettingRow from '~/components/dashboard/DashboardSettingRow.vue';
import DashboardSwitch from '~/components/dashboard/DashboardSwitch.vue';
import { useSettingsDraft } from '~/composables/useSettingsDraft';
import { useSettingsStore } from '~/stores/settings';
import { AUTO_PAGE_SECONDS, AUTO_SLIDE_SECONDS, CARD_OFFSET_Y, DEFAULT_WALL_SETTINGS, normalizeWallSettings, RESET_SECONDS, TOUCH_DOT_SECONDS } from '../../../shared/wall-settings';

const settings = useSettingsStore();
const { draft, dirty, status, save, discard, restoreDefaults } = useSettingsDraft({
  saved: () => settings.wall,
  normalize: normalizeWallSettings,
  defaults: DEFAULT_WALL_SETTINGS,
  save: value => settings.setWall(value),
});

const KEYS = Object.keys(DEFAULT_WALL_SETTINGS) as (keyof WallSettings)[];
const changes = computed(() => KEYS.filter(key => draft.value[key] !== settings.wall[key]).length);
const changed = (key: keyof WallSettings) => draft.value[key] !== DEFAULT_WALL_SETTINGS[key];

function update(patch: Partial<WallSettings>) {
  draft.value = normalizeWallSettings({ ...draft.value, ...patch });
}

const LANGUAGE_BAR_OPTIONS: { value: LanguageBarMode; label: string; hint: string }[] = [
  { value: 'compact', label: 'Compact', hint: 'Bendera kecil di tengah' },
  { value: 'full', label: 'Full width', hint: 'Selebar card, lebih besar' },
  { value: 'grid', label: 'Grid 2 + 1', hint: 'Paling besar, card lebih tinggi' },
];

/** The default of a setting as the operator reads it (shown on the "Default: …" chip). */
function defaultLabel(key: keyof WallSettings) {
  const value = DEFAULT_WALL_SETTINGS[key];
  if (typeof value === 'boolean')
    return value ? 'On' : 'Off';
  if (key === 'languageBar')
    return LANGUAGE_BAR_OPTIONS.find(option => option.value === value)?.label ?? String(value);
  return key === 'cardOffsetY' ? String(value) : `${value} detik`;
}

function reset(key: keyof WallSettings) {
  update({ [key]: DEFAULT_WALL_SETTINGS[key] });
}

function setNumber(key: keyof WallSettings, value: string) {
  const number = Number.parseFloat(value);
  if (Number.isFinite(number))
    update({ [key]: number });
}

/** Tooltip text per setting: short blocks, terms in bold. */
const HELP: Record<string, HelpLine[]> = {
  languageBar: [
    { term: 'Compact', text: 'Bar kecil di tengah card.' },
    { term: 'Full width', text: 'Bar selebar card, tombol bendera lebih besar.' },
    { term: 'Grid 2 + 1', text: 'ID kiri, EN kanan, 中文 di bawah tengah. Tombol paling besar; card jadi lebih tinggi dan semua kolom naik sedikit.' },
    'Area sentuh sensor ikut menyesuaikan.',
  ],
  cardOffsetY: [
    'Menggeser semua kolom di layar LED tanpa mengubah konten.',
    'Area sentuh sensor ikut bergeser, jadi tidak perlu kalibrasi ulang. Tampilan HP/tablet tidak terpengaruh.',
  ],
  showClose: [
    { term: 'Off', text: 'Tombol ✕ hilang, area sentuhnya di sensor ikut dihapus.' },
    'Card tetap tertutup sendiri setelah Reset otomatis, atau lewat tombol operator 1–6, R/Escape, dan OSC.',
  ],
  showArrows: [
    { term: 'Off', text: 'Panah hilang; foto berganti sendiri setiap Auto slide detik.' },
    { term: 'Video', text: 'Diputar sampai selesai dulu, baru lanjut.' },
    { term: 'Dengan Tombol page off', text: 'Page berganti setelah foto terakhirnya.' },
  ],
  showPages: [
    { term: 'Off', text: 'Tab page hilang, teks naik ke bawah foto, page berganti sendiri setiap Auto page detik.' },
    { term: 'Video', text: 'Diputar sampai selesai dulu, baru ganti page.' },
    { term: 'Dengan Tombol slider off', text: 'Page berganti setelah foto terakhirnya, bukan per Auto page.' },
  ],
  resetSeconds: [
    'Kolom yang dibuka atau diganti bahasanya kembali ke tampilan awal (Bahasa Indonesia) setelah sekian detik tanpa sentuhan.',
    { term: 'Saat auto slide/page', text: 'Card menunggu sampai slide terakhir selesai dulu (paling lama 5 menit).' },
  ],
  showTouchDots: [
    { term: 'Biru', text: 'Posisi saat menekan, dengan koordinat.' },
    { term: 'Merah + garis', text: 'Posisi saat dilepas, kalau bergeser.' },
    { term: 'Hijau', text: 'Input dari Sensor Service.' },
    'Di browser lain (mis. TouchDesigner) buka wall dengan ?dots=1.',
  ],
};

const field = 'w-20 rounded-md bg-white/10 px-2 py-1.5 text-right font-bold text-white ring-1 ring-white/15 focus:outline-none focus:ring-2 focus:ring-wall-glow';
const unit = 'text-sm text-sky-100/60';
</script>

<template>
  <section aria-label="Wall" class="space-y-4">
    <DashboardSection title="Tampilan" icon="display" description="Bentuk bar bahasa dan posisi card di layar.">
      <DashboardSettingRow
        data-wall-setting="languageBar" title="Tampilan bahasa" hint="Pilih bentuk bar bendera di card idle."
        :help="HELP.languageBar"
        :changed="changed('languageBar')" :default-label="defaultLabel('languageBar')" @reset="reset('languageBar')"
      >
        <div class="grid w-full grid-cols-3 gap-2 sm:w-auto" role="radiogroup" aria-label="Tampilan bahasa">
          <button
            v-for="mode in LANGUAGE_BAR_OPTIONS" :key="mode.value" type="button" role="radio" :aria-checked="draft.languageBar === mode.value"
            class="flex flex-col items-center gap-1.5 rounded-lg px-2 py-2 text-center ring-1 transition-colors sm:w-28"
            :class="draft.languageBar === mode.value ? 'bg-wall-glow/15 text-white ring-2 ring-wall-glow' : 'text-sky-100/70 ring-white/15 hover:bg-white/5'"
            @click="update({ languageBar: mode.value })"
          >
            <!-- Sketch of an idle card with its language bar in this mode. -->
            <svg viewBox="0 0 48 60" class="h-14 w-12" aria-hidden="true">
              <rect x="2" y="2" width="44" height="56" rx="5" class="fill-white/5 stroke-current" stroke-width="1.5" />
              <rect x="8" y="9" width="32" height="22" rx="2" class="fill-current opacity-25" />
              <template v-if="mode.value === 'compact'">
                <rect x="13" y="42" width="22" height="8" rx="4" class="fill-none stroke-current" stroke-width="1.2" />
                <rect v-for="i in 3" :key="i" :x="14.5 + (i - 1) * 7" y="44" width="5" height="4" rx="1" class="fill-current" />
              </template>
              <template v-else-if="mode.value === 'full'">
                <rect x="5" y="40" width="38" height="12" rx="6" class="fill-none stroke-current" stroke-width="1.2" />
                <rect v-for="i in 3" :key="i" :x="7.5 + (i - 1) * 11.5" y="42.5" width="10" height="7" rx="3" class="fill-current" />
              </template>
              <template v-else>
                <rect x="5" y="34" width="38" height="21" rx="5" class="fill-none stroke-current" stroke-width="1.2" />
                <rect x="7.5" y="36.5" width="16" height="7" rx="3" class="fill-current" />
                <rect x="24.5" y="36.5" width="16" height="7" rx="3" class="fill-current" />
                <rect x="16" y="45.5" width="16" height="7" rx="3" class="fill-current" />
              </template>
            </svg>
            <span class="text-xs font-bold leading-tight">{{ mode.label }}</span>
            <span class="hidden text-[0.7rem] leading-tight text-sky-100/50 sm:block">{{ mode.hint }}</span>
          </button>
        </div>
      </DashboardSettingRow>

      <DashboardSettingRow
        data-wall-setting="cardOffsetY" title="Posisi Y card" :hint="`Geser semua kolom ke atas (−) atau bawah (+), ${CARD_OFFSET_Y.min} s.d. ${CARD_OFFSET_Y.max} px. Default ${DEFAULT_WALL_SETTINGS.cardOffsetY}.`"
        :help="HELP.cardOffsetY"
        :changed="changed('cardOffsetY')" :default-label="defaultLabel('cardOffsetY')" @reset="reset('cardOffsetY')"
      >
        <div class="flex items-center gap-1.5">
          <button type="button" class="size-8 rounded-md font-bold ring-1 ring-white/20 hover:bg-white/10" aria-label="Naikkan card 10 px" @click="update({ cardOffsetY: draft.cardOffsetY - 10 })">
            ↑
          </button>
          <input
            type="number" inputmode="numeric" :class="field" aria-label="Posisi Y card dalam px"
            :min="CARD_OFFSET_Y.min" :max="CARD_OFFSET_Y.max" :step="CARD_OFFSET_Y.step"
            :value="draft.cardOffsetY" @change="setNumber('cardOffsetY', ($event.target as HTMLInputElement).value)"
          >
          <button type="button" class="size-8 rounded-md font-bold ring-1 ring-white/20 hover:bg-white/10" aria-label="Turunkan card 10 px" @click="update({ cardOffsetY: draft.cardOffsetY + 10 })">
            ↓
          </button>
          <span :class="unit">px</span>
        </div>
      </DashboardSettingRow>
    </DashboardSection>

    <DashboardSection title="Tombol di card" icon="buttons" description="Tombol yang terlihat saat card dibuka. Yang dimatikan berjalan otomatis.">
      <DashboardSettingRow
        data-wall-setting="showClose" title="Tombol close" hint="Tombol ✕ di card yang terbuka."
        :help="HELP.showClose"
        :changed="changed('showClose')" :default-label="defaultLabel('showClose')" @reset="reset('showClose')"
      >
        <DashboardSwitch :model-value="draft.showClose" label="Tampilkan tombol close" @update:model-value="update({ showClose: $event })" />
      </DashboardSettingRow>

      <div>
        <DashboardSettingRow
          data-wall-setting="showArrows" title="Tombol slider" hint="Panah foto. Off = foto berganti otomatis."
          :help="HELP.showArrows"
          :changed="changed('showArrows')" :default-label="defaultLabel('showArrows')" @reset="reset('showArrows')"
        >
          <DashboardSwitch :model-value="draft.showArrows" label="Tampilkan tombol slider" @update:model-value="update({ showArrows: $event })" />
        </DashboardSettingRow>
        <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1" leave-active-class="transition duration-150 ease-in" leave-to-class="opacity-0 -translate-y-1">
          <DashboardSettingRow
            v-if="!draft.showArrows" nested data-wall-setting="autoSlideSeconds" title="Auto slide"
            :hint="`Foto berikutnya tiap sekian detik (${AUTO_SLIDE_SECONDS.min}–${AUTO_SLIDE_SECONDS.max} s). Default ${DEFAULT_WALL_SETTINGS.autoSlideSeconds} detik.`"
            :changed="changed('autoSlideSeconds')" :default-label="defaultLabel('autoSlideSeconds')" @reset="reset('autoSlideSeconds')"
          >
            <div class="flex items-center gap-1.5">
              <input
                type="number" inputmode="numeric" :class="field" aria-label="Detik auto slide"
                :min="AUTO_SLIDE_SECONDS.min" :max="AUTO_SLIDE_SECONDS.max" :step="AUTO_SLIDE_SECONDS.step"
                :value="draft.autoSlideSeconds" @change="setNumber('autoSlideSeconds', ($event.target as HTMLInputElement).value)"
              >
              <span :class="unit">s</span>
            </div>
          </DashboardSettingRow>
        </Transition>
      </div>

      <div>
        <DashboardSettingRow
          data-wall-setting="showPages" title="Tombol page" hint="Tab page (1960/1996, PAGE 1/2). Off = page berganti otomatis."
          :help="HELP.showPages"
          :changed="changed('showPages')" :default-label="defaultLabel('showPages')" @reset="reset('showPages')"
        >
          <DashboardSwitch :model-value="draft.showPages" label="Tampilkan tombol page" @update:model-value="update({ showPages: $event })" />
        </DashboardSettingRow>
        <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1" leave-active-class="transition duration-150 ease-in" leave-to-class="opacity-0 -translate-y-1">
          <DashboardSettingRow
            v-if="!draft.showPages" nested data-wall-setting="autoPageSeconds" title="Auto page"
            :hint="`Page berikutnya tiap sekian detik (${AUTO_PAGE_SECONDS.min}–${AUTO_PAGE_SECONDS.max} s). Default ${DEFAULT_WALL_SETTINGS.autoPageSeconds} detik.`"
            :changed="changed('autoPageSeconds')" :default-label="defaultLabel('autoPageSeconds')" @reset="reset('autoPageSeconds')"
          >
            <div class="flex items-center gap-1.5">
              <input
                type="number" inputmode="numeric" :class="field" aria-label="Detik auto page"
                :min="AUTO_PAGE_SECONDS.min" :max="AUTO_PAGE_SECONDS.max" :step="AUTO_PAGE_SECONDS.step"
                :value="draft.autoPageSeconds" @change="setNumber('autoPageSeconds', ($event.target as HTMLInputElement).value)"
              >
              <span :class="unit">s</span>
            </div>
          </DashboardSettingRow>
        </Transition>
      </div>
    </DashboardSection>

    <DashboardSection title="Waktu" icon="timer" description="Kapan kolom kembali ke tampilan awal.">
      <DashboardSettingRow
        data-wall-setting="resetSeconds" title="Reset otomatis" :hint="`Kembali ke awal setelah tidak disentuh (${RESET_SECONDS.min}–${RESET_SECONDS.max} s), semua kolom. Default ${DEFAULT_WALL_SETTINGS.resetSeconds} detik.`"
        :help="HELP.resetSeconds"
        :changed="changed('resetSeconds')" :default-label="defaultLabel('resetSeconds')" @reset="reset('resetSeconds')"
      >
        <div class="flex items-center gap-1.5">
          <input
            type="number" inputmode="numeric" :class="field" aria-label="Detik reset otomatis"
            :min="RESET_SECONDS.min" :max="RESET_SECONDS.max" :step="RESET_SECONDS.step"
            :value="draft.resetSeconds" @change="setNumber('resetSeconds', ($event.target as HTMLInputElement).value)"
          >
          <span :class="unit">s</span>
        </div>
      </DashboardSettingRow>
    </DashboardSection>

    <DashboardSection title="Diagnostik" icon="diagnostic" description="Untuk cek sensor dan kalibrasi. Matikan sebelum acara." warning>
      <template #badge>
        <span v-if="draft.showTouchDots" class="ml-auto shrink-0 rounded-full bg-amber-300/20 px-2.5 py-1 text-xs font-bold text-amber-200 ring-1 ring-amber-300/40" data-diagnostic-on>
          Masih menyala
        </span>
      </template>
      <div>
        <DashboardSettingRow
          data-wall-setting="showTouchDots" title="Titik sentuh" hint="Tampilkan titik di wall setiap ada sentuhan."
          :help="HELP.showTouchDots"
          :changed="changed('showTouchDots')" :default-label="defaultLabel('showTouchDots')" @reset="reset('showTouchDots')"
        >
          <DashboardSwitch :model-value="draft.showTouchDots" label="Tampilkan titik sentuh" @update:model-value="update({ showTouchDots: $event })" />
        </DashboardSettingRow>
        <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1" leave-active-class="transition duration-150 ease-in" leave-to-class="opacity-0 -translate-y-1">
          <DashboardSettingRow
            v-if="draft.showTouchDots" nested data-wall-setting="touchDotSeconds" title="Durasi titik"
            :hint="`Lama titik terlihat setelah dilepas (${TOUCH_DOT_SECONDS.min}–${TOUCH_DOT_SECONDS.max} s). Default ${DEFAULT_WALL_SETTINGS.touchDotSeconds} detik.`"
            :changed="changed('touchDotSeconds')" :default-label="defaultLabel('touchDotSeconds')" @reset="reset('touchDotSeconds')"
          >
            <div class="flex items-center gap-1.5">
              <input
                type="number" inputmode="numeric" :class="field" aria-label="Detik titik sentuh"
                :min="TOUCH_DOT_SECONDS.min" :max="TOUCH_DOT_SECONDS.max" :step="TOUCH_DOT_SECONDS.step"
                :value="draft.touchDotSeconds" @change="setNumber('touchDotSeconds', ($event.target as HTMLInputElement).value)"
              >
              <span :class="unit">s</span>
            </div>
          </DashboardSettingRow>
        </Transition>
      </div>
    </DashboardSection>

    <DashboardFormActions :dirty="dirty" :status="status" :changes="changes" @save="save" @discard="discard" @defaults="restoreDefaults" />
  </section>
</template>
