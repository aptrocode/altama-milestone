<script setup lang="ts">
import type { ClosePosition } from '../../../shared/close-button';
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
import { CLOSE_OFFSET, CLOSE_SCALE } from '../../../shared/close-button';
import { AUTO_PAGE_SECONDS, AUTO_SLIDE_SECONDS, autoPageActive, CARD_OFFSET_Y, DEFAULT_WALL_SETTINGS, normalizeWallSettings, RESET_SECONDS, TOUCH_DOT_SECONDS } from '../../../shared/wall-settings';

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
  // Scroll teks preset (client request): turning it on also turns Tombol slider off (photos
  // auto-slide). Tombol close and the Hold page are left as they are.
  const preset = patch.scrollText && !draft.value.scrollText ? { showArrows: false } : {};
  draft.value = normalizeWallSettings({ ...draft.value, ...patch, ...preset });
}

const LANGUAGE_BAR_OPTIONS: { value: LanguageBarMode; label: string; hint: string }[] = [
  { value: 'compact', label: 'Compact', hint: 'Bendera kecil di tengah' },
  { value: 'full', label: 'Full width', hint: 'Selebar card, lebih besar' },
  { value: 'grid', label: 'Grid 2 + 1', hint: 'Paling besar, card lebih tinggi' },
];

/** Close button place: a title-sized pill under the card (default) or the badge on its corner. */
const CLOSE_POSITION_OPTIONS: { value: ClosePosition; label: string; hint: string }[] = [
  { value: 'bottom', label: 'Di bawah card', hint: 'Tombol merah selebar card, tulisan Tutup' },
  { value: 'corner', label: 'Pojok kanan atas', hint: 'Badge ✕ di border card' },
];

/** Content mode: Page (tabs) or Scroll (`scrollText`, the default). */
const CONTENT_MODE_OPTIONS: { value: boolean; label: string; hint: string }[] = [
  { value: false, label: 'Page', hint: 'Teks dibagi page dengan tab' },
  { value: true, label: 'Scroll', hint: 'Card pendek, teks digeser; Merek Kami tetap 2 page' },
];

/** The default of a setting as the operator reads it (shown on the "Default: …" chip). */
function defaultLabel(key: keyof WallSettings) {
  const value = DEFAULT_WALL_SETTINGS[key];
  if (key === 'scrollText')
    return value ? 'Scroll' : 'Page';
  if (key === 'closePosition')
    return CLOSE_POSITION_OPTIONS.find(option => option.value === value)?.label ?? String(value);
  if (typeof value === 'boolean')
    return value ? 'On' : 'Off';
  if (key === 'languageBar')
    return LANGUAGE_BAR_OPTIONS.find(option => option.value === value)?.label ?? String(value);
  if (key === 'closeScale')
    return `${value}×`;
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
  closePosition: [
    { term: 'Di bawah card', text: 'Tombol merah selebar card (✕ + tulisan tebal TUTUP / CLOSE / 关闭), 20 px di bawah frame idle. Card yang terbuka berhenti di bawah frame idle supaya tidak menabrak tombol; di mode Page teks panjang bisa mengecil (lihat status di Font).' },
    { term: 'Pojok kanan atas', text: 'Badge ✕ kecil di border card; card memanjang sampai di atas gedung seperti biasa. Ukuran dan posisi badge bisa diatur di bawah.' },
    { term: 'Sensor', text: 'Area sentuh tombol close di Sensor Service ikut pindah.' },
  ],
  closeScale: [
    'Memperbesar tombol ✕ di sudut kanan atas card yang terbuka, dari titik tengahnya.',
    { term: 'Sensor', text: 'Area sentuh tombol close di Sensor Service ikut membesar, jadi lebih mudah ditekan dengan LiDAR.' },
  ],
  closeOffset: [
    'Menggeser tombol ✕ dari posisi bawaannya di sudut kanan atas card.',
    { term: 'X', text: 'Minus = ke kiri, plus = ke kanan.' },
    { term: 'Y', text: 'Minus = ke atas, plus = ke bawah.' },
    'Area sentuh sensor dan perintah OSC ikut bergeser.',
  ],
  autoPage: [
    { term: 'On', text: 'Page berikutnya muncul sendiri setiap Durasi auto page, dihitung sejak page terakhir berganti. Menekan tab memulai hitungan lagi.' },
    { term: 'Off', text: 'Page hanya berganti lewat tab.' },
    { term: 'Dengan Tombol slider off', text: 'Page berganti setelah foto terakhirnya. Video diputar sampai selesai dulu.' },
    'Saat Tombol page off, auto page selalu jalan supaya semua page tetap terlihat.',
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
  scrollText: [
    { term: 'Page', text: 'Teks dibagi ke page dengan tab (Tekiro 4, yang lain 1–2). Card memanjang mengikuti teks sampai di atas gedung; dengan tombol close di bawah card, card berhenti di bawah frame idle.' },
    { term: 'Scroll (default)', text: 'Card setinggi frame idle, jadi gedung tetap terlihat. Teks memakai ukuran Maks dari Font dan digeser ke atas/bawah (sentuh-geser, drag mouse, scroll wheel); fade, scrollbar tipis, dan panah ⌄ menandakan masih ada teks. Page lebih sedikit: section 2 (Merek Kami: Tekiro, RYU, Rexco) tetap punya page, masing-masing 2 page dengan tab; section lain 1 page tanpa tab. Foto juga bisa di-swipe kiri/kanan.' },
    { term: 'Saat memilih Scroll', text: 'Tombol slider otomatis off (foto auto slide). Tombol close dan pengaturan Hold tidak diubah. Setelah itu semuanya masih bisa diubah lagi.' },
    { term: 'Sensor', text: 'Geser teks dan swipe foto lewat touchscreen, mouse, atau TD yang mengirim drag. Sensor Service (LiDAR/TUIO) belum mengirim geser; di jalur itu hanya tap.' },
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

/** X / Y rows of the close position: steppers of 2 px with arrows that show the direction. */
const CLOSE_AXES = [
  { key: 'closeOffsetX', label: 'X', less: '←', more: '→', lessLabel: 'Geser tombol close ke kiri', moreLabel: 'Geser tombol close ke kanan', inputLabel: 'Posisi X tombol close dalam px' },
  { key: 'closeOffsetY', label: 'Y', less: '↑', more: '↓', lessLabel: 'Geser tombol close ke atas', moreLabel: 'Geser tombol close ke bawah', inputLabel: 'Posisi Y tombol close dalam px' },
] as const;

// Auto page runs when switched on, and always while the page tabs are hidden.
const autoPageOn = computed(() => autoPageActive(draft.value));

const field = 'w-20 rounded-md bg-white/10 px-2 py-1.5 text-right font-bold text-white ring-1 ring-white/15 focus:outline-none focus:ring-2 focus:ring-wall-glow';
const unit = 'text-sm text-sky-100/60';
</script>

<template>
  <section aria-label="Wall" class="space-y-4">
    <DashboardSection title="Mode konten" icon="card" description="Cara isi card ditampilkan saat kolom dibuka.">
      <DashboardSettingRow
        data-wall-setting="scrollText" title="Mode konten" hint="Page: teks dibagi page dengan tab. Scroll (default): card setinggi frame idle, teks digeser."
        :help="HELP.scrollText"
        :changed="changed('scrollText')" :default-label="defaultLabel('scrollText')" @reset="reset('scrollText')"
      >
        <div class="grid w-full grid-cols-2 gap-2 sm:w-auto" role="radiogroup" aria-label="Mode konten">
          <button
            v-for="mode in CONTENT_MODE_OPTIONS" :key="mode.label" type="button" role="radio" :aria-checked="draft.scrollText === mode.value"
            class="flex flex-col items-center gap-1.5 rounded-lg px-2 py-2 text-center ring-1 transition-colors sm:w-28"
            :class="draft.scrollText === mode.value ? 'bg-wall-glow/15 text-white ring-2 ring-wall-glow' : 'text-sky-100/70 ring-white/15 hover:bg-white/5'"
            @click="update({ scrollText: mode.value })"
          >
            <!-- Sketch of an open card in this mode, with the skyline line under it. -->
            <svg viewBox="0 0 48 60" class="h-14 w-12" aria-hidden="true">
              <line x1="1" y1="56" x2="47" y2="56" class="stroke-current opacity-40" stroke-width="1" stroke-dasharray="2 2" />
              <template v-if="!mode.value">
                <rect x="6" y="2" width="36" height="52" rx="4" class="fill-white/5 stroke-current" stroke-width="1.5" />
                <rect x="10" y="6" width="28" height="12" rx="1.5" class="fill-current opacity-25" />
                <rect x="11" y="21" width="12" height="4" rx="1.5" class="fill-current" />
                <rect x="25" y="21" width="12" height="4" rx="1.5" class="fill-none stroke-current" stroke-width="1" />
                <rect v-for="i in 5" :key="i" x="11" :y="28 + (i - 1) * 4.5" :width="i === 5 ? 16 : 26" height="2" rx="1" class="fill-current opacity-60" />
              </template>
              <template v-else>
                <rect x="6" y="2" width="36" height="40" rx="4" class="fill-white/5 stroke-current" stroke-width="1.5" />
                <rect x="10" y="6" width="28" height="12" rx="1.5" class="fill-current opacity-25" />
                <rect x="11" y="20" width="10" height="3.5" rx="1.5" class="fill-current" />
                <rect x="22" y="20" width="10" height="3.5" rx="1.5" class="fill-none stroke-current" stroke-width="1" />
                <rect v-for="i in 3" :key="i" x="11" :y="26.5 + (i - 1) * 4" width="22" height="2" rx="1" class="fill-current opacity-60" />
                <rect x="36" y="26" width="2" height="12" rx="1" class="fill-current opacity-25" />
                <rect x="36" y="26" width="2" height="5" rx="1" class="fill-current" />
                <path d="M21 46 L24 49 L27 46" class="fill-none stroke-current" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </template>
            </svg>
            <span class="text-xs font-bold leading-tight">{{ mode.label }}</span>
            <span class="hidden text-[0.7rem] leading-tight text-sky-100/50 sm:block">{{ mode.hint }}</span>
          </button>
        </div>
      </DashboardSettingRow>
    </DashboardSection>

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
      <div>
        <DashboardSettingRow
          data-wall-setting="showClose" title="Tombol close" hint="Tombol Tutup (✕) di card yang terbuka."
          :help="HELP.showClose"
          :changed="changed('showClose')" :default-label="defaultLabel('showClose')" @reset="reset('showClose')"
        >
          <DashboardSwitch :model-value="draft.showClose" label="Tampilkan tombol close" @update:model-value="update({ showClose: $event })" />
        </DashboardSettingRow>
        <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1" leave-active-class="transition duration-150 ease-in" leave-to-class="opacity-0 -translate-y-1">
          <DashboardSettingRow
            v-if="draft.showClose" nested data-wall-setting="closePosition" title="Letak tombol close"
            hint="Di bawah card (tombol merah selebar card) atau badge ✕ di pojok kanan atas."
            :help="HELP.closePosition"
            :changed="changed('closePosition')" :default-label="defaultLabel('closePosition')" @reset="reset('closePosition')"
          >
            <div class="grid w-full grid-cols-2 gap-2 sm:w-auto" role="radiogroup" aria-label="Letak tombol close">
              <button
                v-for="option in CLOSE_POSITION_OPTIONS" :key="option.value" type="button" role="radio" :aria-checked="draft.closePosition === option.value"
                class="flex flex-col items-center gap-1.5 rounded-lg px-2 py-2 text-center ring-1 transition-colors sm:w-28"
                :class="draft.closePosition === option.value ? 'bg-wall-glow/15 text-white ring-2 ring-wall-glow' : 'text-sky-100/70 ring-white/15 hover:bg-white/5'"
                @click="update({ closePosition: option.value })"
              >
                <!-- Sketch of an open card with its close button in this place. -->
                <svg viewBox="0 0 48 60" class="h-14 w-12" aria-hidden="true">
                  <template v-if="option.value === 'bottom'">
                    <rect x="6" y="2" width="36" height="38" rx="4" class="fill-white/5 stroke-current" stroke-width="1.5" />
                    <rect x="10" y="6" width="28" height="11" rx="1.5" class="fill-current opacity-25" />
                    <rect v-for="i in 3" :key="i" x="11" :y="21 + (i - 1) * 4.5" width="24" height="2" rx="1" class="fill-current opacity-60" />
                    <!-- Solid red capsule as wide as the card: white ✕ and the bold label. -->
                    <rect x="6" y="45" width="36" height="11" rx="5.5" class="fill-red-600" />
                    <path d="M14.5 48.5 L18.5 52.5 M18.5 48.5 L14.5 52.5" class="stroke-white" stroke-width="1.3" stroke-linecap="round" />
                    <rect x="21" y="49.3" width="13" height="2.4" rx="1" class="fill-white" />
                  </template>
                  <template v-else>
                    <rect x="6" y="6" width="36" height="50" rx="4" class="fill-white/5 stroke-current" stroke-width="1.5" />
                    <rect x="10" y="10" width="28" height="12" rx="1.5" class="fill-current opacity-25" />
                    <rect v-for="i in 5" :key="i" x="11" :y="26 + (i - 1) * 4.5" width="24" height="2" rx="1" class="fill-current opacity-60" />
                    <circle cx="41" cy="7" r="4.5" class="fill-white/10 stroke-current" stroke-width="1.2" />
                    <path d="M39 5 L43 9 M43 5 L39 9" class="stroke-current" stroke-width="1.2" />
                  </template>
                </svg>
                <span class="text-xs font-bold leading-tight">{{ option.label }}</span>
                <span class="hidden text-[0.7rem] leading-tight text-sky-100/50 sm:block">{{ option.hint }}</span>
              </button>
            </div>
          </DashboardSettingRow>
        </Transition>
        <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1" leave-active-class="transition duration-150 ease-in" leave-to-class="opacity-0 -translate-y-1">
          <DashboardSettingRow
            v-if="draft.showClose && draft.closePosition === 'corner'" nested data-wall-setting="closeScale" title="Ukuran tombol close"
            :hint="`1× = ukuran sekarang, 2× = dua kali lebih besar, atau isi manual (${CLOSE_SCALE.min}–${CLOSE_SCALE.max}×).`"
            :help="HELP.closeScale"
            :changed="changed('closeScale')" :default-label="defaultLabel('closeScale')" @reset="reset('closeScale')"
          >
            <div class="flex flex-wrap items-center gap-2">
              <div class="flex rounded-lg bg-white/10 p-1 ring-1 ring-white/15" role="radiogroup" aria-label="Ukuran cepat tombol close">
                <button
                  v-for="preset in [1, 2]" :key="preset" type="button" role="radio" :aria-checked="draft.closeScale === preset"
                  class="rounded-md px-3 py-1.5 text-sm font-bold transition-colors"
                  :class="draft.closeScale === preset ? 'bg-wall-glow text-[#050d4f]' : 'text-sky-100/70 hover:bg-white/10'"
                  @click="update({ closeScale: preset })"
                >
                  {{ preset }}×
                </button>
              </div>
              <div class="flex items-center gap-1.5">
                <input
                  type="number" inputmode="decimal" :class="field" aria-label="Ukuran tombol close manual"
                  :min="CLOSE_SCALE.min" :max="CLOSE_SCALE.max" :step="CLOSE_SCALE.step"
                  :value="draft.closeScale" @change="setNumber('closeScale', ($event.target as HTMLInputElement).value)"
                >
                <span :class="unit">×</span>
              </div>
              <!-- Sketch of the badge at this size (44 px at 1×, drawn half-size). -->
              <span
                class="grid shrink-0 place-items-center rounded-full bg-[#0b1a78] font-bold text-white ring-2 ring-[#bfe8ff]" aria-hidden="true"
                :style="{ width: `${22 * draft.closeScale}px`, height: `${22 * draft.closeScale}px`, fontSize: `${10 * draft.closeScale}px` }"
              >✕</span>
            </div>
          </DashboardSettingRow>
        </Transition>
        <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1" leave-active-class="transition duration-150 ease-in" leave-to-class="opacity-0 -translate-y-1">
          <DashboardSettingRow
            v-if="draft.showClose && draft.closePosition === 'corner'" nested data-wall-setting="closeOffset" title="Posisi tombol close"
            :hint="`Geser ✕ ke kiri/kanan (X) dan atas/bawah (Y), ${CLOSE_OFFSET.min} s.d. ${CLOSE_OFFSET.max} px. Default 0.`"
            :help="HELP.closeOffset"
            :changed="changed('closeOffsetX') || changed('closeOffsetY')" default-label="X 0 · Y 0"
            @reset="update({ closeOffsetX: 0, closeOffsetY: 0 })"
          >
            <div class="flex flex-wrap items-center gap-3">
              <div v-for="axis in CLOSE_AXES" :key="axis.key" class="flex items-center gap-1.5">
                <span class="w-3 text-sm font-bold text-sky-100/70">{{ axis.label }}</span>
                <button type="button" class="size-8 rounded-md font-bold ring-1 ring-white/20 hover:bg-white/10" :aria-label="axis.lessLabel" @click="update({ [axis.key]: draft[axis.key] - 2 })">
                  {{ axis.less }}
                </button>
                <input
                  type="number" inputmode="numeric" :class="field" :aria-label="axis.inputLabel"
                  :min="CLOSE_OFFSET.min" :max="CLOSE_OFFSET.max" :step="CLOSE_OFFSET.step"
                  :value="draft[axis.key]" @change="setNumber(axis.key, ($event.target as HTMLInputElement).value)"
                >
                <button type="button" class="size-8 rounded-md font-bold ring-1 ring-white/20 hover:bg-white/10" :aria-label="axis.moreLabel" @click="update({ [axis.key]: draft[axis.key] + 2 })">
                  {{ axis.more }}
                </button>
              </div>
              <span :class="unit">px</span>
            </div>
          </DashboardSettingRow>
        </Transition>
      </div>

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
          data-wall-setting="showPages" title="Tombol page" hint="Tab page (PAGE 1–4). Off = tab hilang, page berganti otomatis."
          :help="HELP.showPages"
          :changed="changed('showPages')" :default-label="defaultLabel('showPages')" @reset="reset('showPages')"
        >
          <DashboardSwitch :model-value="draft.showPages" label="Tampilkan tombol page" @update:model-value="update({ showPages: $event })" />
        </DashboardSettingRow>
        <DashboardSettingRow
          data-wall-setting="autoPage" title="Auto page" hint="Page berganti sendiri, juga saat tab page tampil."
          :help="HELP.autoPage"
          :changed="changed('autoPage')" :default-label="defaultLabel('autoPage')" @reset="reset('autoPage')"
        >
          <div class="flex flex-col items-end gap-1">
            <DashboardSwitch :model-value="autoPageOn" label="Auto page" @update:model-value="update({ autoPage: $event })" />
            <span v-if="!draft.showPages" class="text-xs text-sky-100/50">Selalu on saat Tombol page off</span>
          </div>
        </DashboardSettingRow>
        <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1" leave-active-class="transition duration-150 ease-in" leave-to-class="opacity-0 -translate-y-1">
          <DashboardSettingRow
            v-if="autoPageOn" nested data-wall-setting="autoPageSeconds" title="Durasi auto page"
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
