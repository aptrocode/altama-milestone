<script setup lang="ts">
import type { CardText, CardTextKey, FontSettings } from '../../../shared/font-settings';
import type { CardFit } from '~/components/dashboard/DashboardCardFit.vue';
import type { HelpLine } from '~/components/dashboard/DashboardSettingRow.vue';
import { computed, ref } from 'vue';
import DashboardCardFit from '~/components/dashboard/DashboardCardFit.vue';
import DashboardFormActions from '~/components/dashboard/DashboardFormActions.vue';
import DashboardSection from '~/components/dashboard/DashboardSection.vue';
import DashboardSettingRow from '~/components/dashboard/DashboardSettingRow.vue';
import DashboardSwitch from '~/components/dashboard/DashboardSwitch.vue';
import { useSettingsDraft } from '~/composables/useSettingsDraft';
import { useSettingsStore } from '~/stores/settings';
import { CARD_TEXT_KEYS, CARD_TEXT_LIMITS, DEFAULT_FONT_SETTINGS, FONT_SIZE_LIMITS, FONT_WEIGHTS, normalizeFontSettings } from '../../../shared/font-settings';

type SizeKey = keyof typeof FONT_SIZE_LIMITS;

const settings = useSettingsStore();
const { draft, dirty, status, save, discard, restoreDefaults } = useSettingsDraft({
  saved: () => settings.fonts,
  normalize: normalizeFontSettings,
  defaults: DEFAULT_FONT_SETTINGS,
  save: value => settings.setFonts(value),
});

const KEYS = (Object.keys(DEFAULT_FONT_SETTINGS) as (keyof FontSettings)[]).filter(key => key !== 'cards');
const sameCard = (a: CardText, b: CardText) => a.size === b.size && a.fill === b.fill;
const changes = computed(() => KEYS.filter(key => draft.value[key] !== settings.fonts[key]).length
  + CARD_TEXT_KEYS.filter(key => !sameCard(draft.value.cards[key], settings.fonts.cards[key])).length);
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

// Open-card text per card (a column, or a sub-item of columns 2 and 5).
function updateCard(key: CardTextKey, patch: Partial<CardText>) {
  update({ cards: { ...draft.value.cards, [key]: { ...draft.value.cards[key], ...patch } } });
}
function setCardSize(key: CardTextKey, value: string) {
  const number = Number.parseFloat(value);
  if (Number.isFinite(number))
    updateCard(key, { size: number });
}
const cardChanged = (key: CardTextKey) => !sameCard(draft.value.cards[key], DEFAULT_FONT_SETTINGS.cards[key]);
const cardDefault = (key: CardTextKey) => `${DEFAULT_FONT_SETTINGS.cards[key].size} px${DEFAULT_FONT_SETTINGS.cards[key].fill ? ' · penuh' : ''}`;

const CARDS: { key: CardTextKey; title: string; hint: string }[] = [
  { key: 'about-altama', title: 'Tentang Altama', hint: 'Kolom 1' },
  { key: 'tekiro', title: 'Tekiro', hint: 'Kolom 2 · Merek Kami' },
  { key: 'ryu', title: 'RYU', hint: 'Kolom 2 · Merek Kami' },
  { key: 'rexco', title: 'Rexco', hint: 'Kolom 2 · Merek Kami' },
  { key: 'infrastructure', title: 'Infrastruktur', hint: 'Kolom 3' },
  { key: 'digital-partners', title: 'Kepercayaan Digital', hint: 'Kolom 4' },
  { key: 'distribusi', title: 'Distribusi', hint: 'Kolom 5' },
  { key: 'pemasaran', title: 'Pemasaran', hint: 'Kolom 5' },
  { key: 'summit-2026', title: 'KTT Altama 2026', hint: 'Kolom 6' },
];
const CARD_HELP: HelpLine[] = [
  'Ukuran teks isi card saat kolom ini dibuka, untuk semua page dan bahasa. Label biru (mis. "Lahir") ikut proporsional.',
  { term: 'Penuhi card', text: 'On: teks mulai dari ukuran ini lalu membesar sendiri sampai card penuh. Off: teks tetap di ukuran ini dan card memanjang mengikuti teks.' },
  { term: 'Status', text: 'Dicek di semua page dan bahasa. "Terlalu besar" berarti teks tidak muat di card tertinggi, jadi wall mengecilkannya ke persen yang tertulis. Kecilkan ukurannya, atau minta isi card dipecah jadi page tambahan.' },
  { term: 'Selalu penuh', text: 'Page yang memang dibuat untuk memenuhi card (penghargaan Tekiro dan RYU) tetap membesar walau Penuhi card Off.' },
];

const fits = ref<Partial<Record<CardTextKey, CardFit>>>({});
const LOCALE_LABEL = { 'id': 'ID', 'en': 'EN', 'zh-Hans': '中文' } as const;
function fitLabel(key: CardTextKey) {
  const fit = fits.value[key];
  if (!fit)
    return null;
  if (fit.scale >= 0.995)
    return { ok: true, text: '✓ Muat' };
  return { ok: false, text: `⚠ Terlalu besar · dikecilkan ke ${Math.round(fit.scale * 100)}% (PAGE ${fit.page + 1}, ${LOCALE_LABEL[fit.locale]})` };
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

    <DashboardSection title="Isi card per section" icon="card" description="Ukuran teks di dalam card yang terbuka, diatur per card. Status di kanan menunjukkan apakah teks muat.">
      <DashboardSettingRow
        v-for="row in CARDS" :key="row.key"
        :data-card-text="row.key" :title="row.title" :hint="row.hint" :help="CARD_HELP"
        :changed="cardChanged(row.key)" :default-label="cardDefault(row.key)" @reset="updateCard(row.key, DEFAULT_FONT_SETTINGS.cards[row.key])"
      >
        <div class="flex w-full flex-wrap items-center justify-end gap-x-4 gap-y-2 sm:w-auto">
          <span
            v-if="fitLabel(row.key)" data-fit
            class="rounded-full px-2.5 py-1 text-xs font-bold"
            :class="fitLabel(row.key)!.ok ? 'bg-emerald-400/15 text-emerald-300' : 'bg-amber-400/15 text-amber-200'"
          >{{ fitLabel(row.key)!.text }}</span>
          <div class="flex items-center gap-1.5">
            <button type="button" :class="stepper" :aria-label="`Perkecil teks ${row.title}`" :disabled="draft.cards[row.key].size <= CARD_TEXT_LIMITS.min" @click="updateCard(row.key, { size: draft.cards[row.key].size - 1 })">
              −
            </button>
            <input
              type="number" inputmode="numeric" :class="field" :aria-label="`Ukuran teks ${row.title} dalam px`"
              :min="CARD_TEXT_LIMITS.min" :max="CARD_TEXT_LIMITS.max" :step="CARD_TEXT_LIMITS.step"
              :value="draft.cards[row.key].size" @change="setCardSize(row.key, ($event.target as HTMLInputElement).value)"
            >
            <button type="button" :class="stepper" :aria-label="`Perbesar teks ${row.title}`" :disabled="draft.cards[row.key].size >= CARD_TEXT_LIMITS.max" @click="updateCard(row.key, { size: draft.cards[row.key].size + 1 })">
              +
            </button>
            <span class="w-5 text-sm text-sky-100/60">px</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-sky-100/70">Penuhi card</span>
            <DashboardSwitch :model-value="draft.cards[row.key].fill" :label="`Penuhi card ${row.title}`" @update:model-value="updateCard(row.key, { fill: $event })" />
          </div>
        </div>
      </DashboardSettingRow>
      <DashboardCardFit :cards="draft.cards" :show-pages="settings.wall.showPages" :offset-y="settings.wall.cardOffsetY" @result="fits = $event" />
    </DashboardSection>

    <DashboardSection title="Tab page" icon="card" description="Tombol page di card yang terbuka.">
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
