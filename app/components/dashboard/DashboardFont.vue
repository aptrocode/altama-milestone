<script setup lang="ts">
import type { FontSettings } from '../../../shared/font-settings';
import type { HelpLine } from '~/components/dashboard/DashboardSettingRow.vue';
import { computed } from 'vue';
import DashboardFormActions from '~/components/dashboard/DashboardFormActions.vue';
import DashboardSection from '~/components/dashboard/DashboardSection.vue';
import DashboardSettingRow from '~/components/dashboard/DashboardSettingRow.vue';
import { useSettingsDraft } from '~/composables/useSettingsDraft';
import { useSettingsStore } from '~/stores/settings';
import { DEFAULT_FONT_SETTINGS, FONT_SIZE_LIMITS, FONT_WEIGHTS, normalizeFontSettings } from '../../../shared/font-settings';

type SizeKey = keyof typeof FONT_SIZE_LIMITS;

const settings = useSettingsStore();
const { draft, dirty, status, save, discard, restoreDefaults } = useSettingsDraft({
  saved: () => settings.fonts,
  normalize: normalizeFontSettings,
  defaults: DEFAULT_FONT_SETTINGS,
  save: value => settings.setFonts(value),
});

const KEYS = Object.keys(DEFAULT_FONT_SETTINGS) as (keyof FontSettings)[];
const changes = computed(() => KEYS.filter(key => draft.value[key] !== settings.fonts[key]).length);
const changed = (key: keyof FontSettings) => draft.value[key] !== DEFAULT_FONT_SETTINGS[key];

function update(patch: Partial<FontSettings>) {
  draft.value = normalizeFontSettings({ ...draft.value, ...patch });
}
function reset(key: keyof FontSettings) {
  update({ [key]: DEFAULT_FONT_SETTINGS[key] });
}
function setSize(key: SizeKey, value: string) {
  const number = Number.parseFloat(value);
  if (Number.isFinite(number))
    update({ [key]: number });
}
function nudge(key: SizeKey, delta: number) {
  update({ [key]: draft.value[key] + delta });
}

const WEIGHT_LABEL: Record<number, string> = { 400: 'Regular', 500: 'Medium', 700: 'Bold', 800: 'Extra', 900: 'Black' };
const defaultSize = (key: SizeKey) => `${DEFAULT_FONT_SETTINGS[key]} px`;

/** One row per size: what it changes, a sample in that size, and its tooltip. */
const SIZES: { key: SizeKey; title: string; hint: string; sample: string; weight: number; upper?: boolean; help: HelpLine[] }[] = [
  {
    key: 'titleSize',
    title: 'Judul section',
    hint: 'Teks di pill atas tiap kolom.',
    sample: 'Infrastruktur',
    weight: 0,
    upper: true,
    help: [
      'Judul di pill setiap kolom (Tentang Altama, Our Brand, …).',
      { term: 'Batas', text: 'Pill punya ukuran tetap. Judul panjang pindah ke dua baris; di atas batas maksimum teks bisa terpotong.' },
    ],
  },
  {
    key: 'subItemSize',
    title: 'Nama sub-item',
    hint: 'Nama di atas card yang terbuka, kalau tidak ada logo.',
    sample: 'Pemasaran',
    weight: 800,
    upper: true,
    help: ['Muncul di atas card Distribusi / Pemasaran saat dibuka. Brand dengan logo (Tekiro, RYU, Rexco) memakai gambar logonya, bukan teks.'],
  },
  {
    key: 'captionSize',
    title: 'Caption tile',
    hint: 'Label di tile kolom Distribusi & Pemasaran.',
    sample: 'Distribusi',
    weight: 800,
    upper: true,
    help: ['Label di atas gambar tile pada card idle kolom 5.'],
  },
  {
    key: 'tabSize',
    title: 'Tab page',
    hint: 'Tombol page di card terbuka (1960/1996, PAGE 1/2).',
    sample: 'Page 1',
    weight: 700,
    upper: true,
    help: ['Teks di tombol tab page. Tombolnya berukuran tetap, jadi ukuran besar lebih cepat terasa sempit.'],
  },
  {
    key: 'bodySize',
    title: 'Isi konten',
    hint: 'Paragraf dan daftar di card terbuka.',
    sample: 'Distributor alat teknik terpercaya.',
    weight: 500,
    help: [
      'Teks utama di card yang terbuka. Label biru (mis. "Lahir") ikut proporsional.',
      { term: 'Otomatis', text: 'Card memanjang dulu mengikuti teks; kalau masih tidak muat, teks mengecil sendiri supaya tidak terpotong.' },
    ],
  },
];

const field = 'w-16 rounded-md bg-white/10 px-2 py-1.5 text-right font-bold text-white ring-1 ring-white/15 focus:outline-none focus:ring-2 focus:ring-wall-glow';
const stepper = 'grid size-8 place-items-center rounded-md font-bold ring-1 ring-white/20 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent';
</script>

<template>
  <section aria-label="Font" class="space-y-4">
    <DashboardSection title="Judul" icon="font" description="Teks besar di card idle dan di atas card yang terbuka.">
      <template v-for="row in SIZES.slice(0, 3)" :key="row.key">
        <DashboardSettingRow
          :data-font-setting="row.key" :title="row.title" :hint="row.hint" :help="row.help"
          :changed="changed(row.key)" :default-label="defaultSize(row.key)" @reset="reset(row.key)"
        >
          <div class="flex w-full flex-wrap items-center justify-end gap-3 sm:w-auto">
            <span
              class="max-w-56 truncate rounded-md bg-[#0b1a78] px-2.5 py-1 leading-tight text-white ring-1 ring-wall-glow/30"
              :class="row.upper ? 'uppercase' : ''" aria-hidden="true"
              :style="{ fontSize: `${draft[row.key] * 0.75}px`, fontWeight: row.key === 'titleSize' ? draft.titleWeight : row.weight }"
            >{{ row.sample }}</span>
            <div class="flex items-center gap-1.5">
              <button type="button" :class="stepper" :aria-label="`Perkecil ${row.title}`" :disabled="draft[row.key] <= FONT_SIZE_LIMITS[row.key].min" @click="nudge(row.key, -1)">
                −
              </button>
              <input
                type="number" inputmode="numeric" :class="field" :aria-label="`Ukuran ${row.title} dalam px`"
                :min="FONT_SIZE_LIMITS[row.key].min" :max="FONT_SIZE_LIMITS[row.key].max" :step="FONT_SIZE_LIMITS[row.key].step"
                :value="draft[row.key]" @change="setSize(row.key, ($event.target as HTMLInputElement).value)"
              >
              <button type="button" :class="stepper" :aria-label="`Perbesar ${row.title}`" :disabled="draft[row.key] >= FONT_SIZE_LIMITS[row.key].max" @click="nudge(row.key, 1)">
                +
              </button>
              <span class="w-5 text-sm text-sky-100/60">px</span>
            </div>
          </div>
        </DashboardSettingRow>
        <DashboardSettingRow
          v-if="row.key === 'titleSize'" nested data-font-setting="titleWeight" title="Ketebalan judul"
          hint="Seberapa tebal teks judul section."
          :changed="changed('titleWeight')" :default-label="WEIGHT_LABEL[DEFAULT_FONT_SETTINGS.titleWeight]" @reset="reset('titleWeight')"
        >
          <div class="flex flex-wrap rounded-lg bg-white/10 p-1 ring-1 ring-white/15" role="radiogroup" aria-label="Ketebalan judul">
            <button
              v-for="weight in FONT_WEIGHTS" :key="weight" type="button" role="radio" :aria-checked="draft.titleWeight === weight"
              class="rounded-md px-2.5 py-1.5 text-sm transition-colors" :style="{ fontWeight: weight }"
              :class="draft.titleWeight === weight ? 'bg-wall-glow text-[#050d4f]' : 'text-sky-100/70 hover:bg-white/10'"
              @click="update({ titleWeight: weight })"
            >
              {{ WEIGHT_LABEL[weight] }}
            </button>
          </div>
        </DashboardSettingRow>
      </template>
    </DashboardSection>

    <DashboardSection title="Card terbuka" icon="card" description="Teks di dalam card saat kolom dibuka.">
      <DashboardSettingRow
        v-for="row in SIZES.slice(3)" :key="row.key"
        :data-font-setting="row.key" :title="row.title" :hint="row.hint" :help="row.help"
        :changed="changed(row.key)" :default-label="defaultSize(row.key)" @reset="reset(row.key)"
      >
        <div class="flex w-full flex-wrap items-center justify-end gap-3 sm:w-auto">
          <span
            class="max-w-56 truncate rounded-md bg-[#0b1a78] px-2.5 py-1 leading-tight text-white ring-1 ring-wall-glow/30"
            :class="row.upper ? 'uppercase' : ''" aria-hidden="true"
            :style="{ fontSize: `${draft[row.key] * 0.75}px`, fontWeight: row.weight }"
          >{{ row.sample }}</span>
          <div class="flex items-center gap-1.5">
            <button type="button" :class="stepper" :aria-label="`Perkecil ${row.title}`" :disabled="draft[row.key] <= FONT_SIZE_LIMITS[row.key].min" @click="nudge(row.key, -1)">
              −
            </button>
            <input
              type="number" inputmode="numeric" :class="field" :aria-label="`Ukuran ${row.title} dalam px`"
              :min="FONT_SIZE_LIMITS[row.key].min" :max="FONT_SIZE_LIMITS[row.key].max" :step="FONT_SIZE_LIMITS[row.key].step"
              :value="draft[row.key]" @change="setSize(row.key, ($event.target as HTMLInputElement).value)"
            >
            <button type="button" :class="stepper" :aria-label="`Perbesar ${row.title}`" :disabled="draft[row.key] >= FONT_SIZE_LIMITS[row.key].max" @click="nudge(row.key, 1)">
              +
            </button>
            <span class="w-5 text-sm text-sky-100/60">px</span>
          </div>
        </div>
      </DashboardSettingRow>
    </DashboardSection>

    <p class="px-1 text-sm text-sky-100/55">
      Semua teks memakai font Roboto. Ukuran dalam px layar wall (2304 × 1344); contoh di kanan digambar sedikit lebih kecil. Simpan untuk menerapkan ke wall di browser ini.
    </p>

    <DashboardFormActions :dirty="dirty" :status="status" :changes="changes" @save="save" @discard="discard" @defaults="restoreDefaults" />
  </section>
</template>
