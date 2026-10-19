<script setup lang="ts">
import type { WallSettings } from '../../../shared/wall-settings';
import DashboardFormActions from '~/components/dashboard/DashboardFormActions.vue';
import { useSettingsDraft } from '~/composables/useSettingsDraft';
import { useSettingsStore } from '~/stores/settings';
import { AUTO_PAGE_SECONDS, AUTO_SLIDE_SECONDS, CARD_OFFSET_Y, DEFAULT_WALL_SETTINGS, normalizeWallSettings, RESET_SECONDS } from '../../../shared/wall-settings';

const settings = useSettingsStore();
const { draft, dirty, status, save, restoreDefaults } = useSettingsDraft({
  saved: () => settings.wall,
  normalize: normalizeWallSettings,
  defaults: DEFAULT_WALL_SETTINGS,
  save: value => settings.setWall(value),
});
const LANGUAGE_BAR_OPTIONS = [{ value: 'compact', label: 'Compact' }, { value: 'full', label: 'Full width' }] as const;
const field = 'w-20 rounded-md bg-white/10 px-2 py-1.5 text-right font-bold text-white ring-1 ring-white/15 focus:outline-none focus:ring-2 focus:ring-wall-glow';

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
      <li class="flex flex-wrap items-center gap-4 px-4 py-4" data-wall-setting="showClose">
        <div class="min-w-0 flex-1 basis-56">
          <p class="font-bold text-white">
            Tombol close
          </p>
          <p class="text-sm text-sky-100/60">
            Tampilkan tombol ✕ di card yang terbuka. Jika off, card tetap tertutup otomatis setelah waktu reset.
          </p>
        </div>
        <button
          type="button" role="switch" :aria-checked="draft.showClose" aria-label="Tampilkan tombol close"
          class="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors"
          :class="draft.showClose ? 'bg-emerald-400' : 'bg-white/20'"
          @click="draft = normalizeWallSettings({ ...draft, showClose: !draft.showClose })"
        >
          <span class="inline-block size-5 rounded-full bg-white shadow transition-transform" :class="draft.showClose ? 'translate-x-6' : 'translate-x-1'" />
        </button>
      </li>
      <li class="flex flex-wrap items-center gap-4 px-4 py-4" data-wall-setting="showArrows">
        <div class="min-w-0 flex-1 basis-56">
          <p class="font-bold text-white">
            Tombol slider
          </p>
          <p class="text-sm text-sky-100/60">
            Tampilkan panah foto di card yang terbuka. Jika off, foto berganti otomatis (auto slide).
          </p>
        </div>
        <button
          type="button" role="switch" :aria-checked="draft.showArrows" aria-label="Tampilkan tombol slider"
          class="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors"
          :class="draft.showArrows ? 'bg-emerald-400' : 'bg-white/20'"
          @click="draft = normalizeWallSettings({ ...draft, showArrows: !draft.showArrows })"
        >
          <span class="inline-block size-5 rounded-full bg-white shadow transition-transform" :class="draft.showArrows ? 'translate-x-6' : 'translate-x-1'" />
        </button>
      </li>
      <li v-if="!draft.showArrows" class="flex flex-wrap items-center gap-4 px-4 py-4" data-wall-setting="autoSlideSeconds">
        <div class="min-w-0 flex-1 basis-56">
          <p class="font-bold text-white">
            Auto slide
          </p>
          <p class="text-sm text-sky-100/60">
            Foto berikutnya muncul setiap sekian detik ({{ AUTO_SLIDE_SECONDS.min }}–{{ AUTO_SLIDE_SECONDS.max }} s). Video diputar sampai selesai dulu. Hitungan mulai ulang setiap kali foto atau page berganti.
          </p>
        </div>
        <div class="flex items-center gap-1.5">
          <input
            type="number" inputmode="numeric" :class="field"
            aria-label="Detik auto slide" :min="AUTO_SLIDE_SECONDS.min" :max="AUTO_SLIDE_SECONDS.max" :step="AUTO_SLIDE_SECONDS.step"
            :value="draft.autoSlideSeconds" @change="set('autoSlideSeconds', ($event.target as HTMLInputElement).value)"
          >
          <span class="text-sm text-sky-100/60">s</span>
        </div>
      </li>
      <li class="flex flex-wrap items-center gap-4 px-4 py-4" data-wall-setting="showPages">
        <div class="min-w-0 flex-1 basis-56">
          <p class="font-bold text-white">
            Tombol page
          </p>
          <p class="text-sm text-sky-100/60">
            Tampilkan tab page (mis. 1960/1996, PAGE 1/2) di card yang terbuka. Jika off, page berganti otomatis (auto page).
          </p>
        </div>
        <button
          type="button" role="switch" :aria-checked="draft.showPages" aria-label="Tampilkan tombol page"
          class="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors"
          :class="draft.showPages ? 'bg-emerald-400' : 'bg-white/20'"
          @click="draft = normalizeWallSettings({ ...draft, showPages: !draft.showPages })"
        >
          <span class="inline-block size-5 rounded-full bg-white shadow transition-transform" :class="draft.showPages ? 'translate-x-6' : 'translate-x-1'" />
        </button>
      </li>
      <li v-if="!draft.showPages" class="flex flex-wrap items-center gap-4 px-4 py-4" data-wall-setting="autoPageSeconds">
        <div class="min-w-0 flex-1 basis-56">
          <p class="font-bold text-white">
            Auto page
          </p>
          <p class="text-sm text-sky-100/60">
            Page berikutnya muncul setiap sekian detik ({{ AUTO_PAGE_SECONDS.min }}–{{ AUTO_PAGE_SECONDS.max }} s), dihitung sejak page terakhir berganti. Video diputar sampai selesai dulu.
          </p>
        </div>
        <div class="flex items-center gap-1.5">
          <input
            type="number" inputmode="numeric" :class="field"
            aria-label="Detik auto page" :min="AUTO_PAGE_SECONDS.min" :max="AUTO_PAGE_SECONDS.max" :step="AUTO_PAGE_SECONDS.step"
            :value="draft.autoPageSeconds" @change="set('autoPageSeconds', ($event.target as HTMLInputElement).value)"
          >
          <span class="text-sm text-sky-100/60">s</span>
        </div>
      </li>
      <li class="flex flex-wrap items-center gap-4 px-4 py-4" data-wall-setting="languageBar">
        <div class="min-w-0 flex-1 basis-56">
          <p class="font-bold text-white">
            Tampilan bahasa
          </p>
          <p class="text-sm text-sky-100/60">
            Compact: bar bendera kecil di tengah. Full width: bar selebar card dengan tombol bendera lebih besar. Area sentuh sensor ikut berubah.
          </p>
        </div>
        <div class="flex rounded-lg bg-white/10 p-1 ring-1 ring-white/15" role="radiogroup" aria-label="Tampilan bahasa">
          <button
            v-for="mode in LANGUAGE_BAR_OPTIONS" :key="mode.value" type="button" role="radio" :aria-checked="draft.languageBar === mode.value"
            class="rounded-md px-3 py-1.5 text-sm font-bold transition-colors"
            :class="draft.languageBar === mode.value ? 'bg-wall-glow text-[#050d4f]' : 'text-sky-100/70 hover:bg-white/10'"
            @click="draft = normalizeWallSettings({ ...draft, languageBar: mode.value })"
          >
            {{ mode.label }}
          </button>
        </div>
      </li>
    </ul>

    <DashboardFormActions :dirty="dirty" :status="status" @save="save" @defaults="restoreDefaults" />
  </section>
</template>
