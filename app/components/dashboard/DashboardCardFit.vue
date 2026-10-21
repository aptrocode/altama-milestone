<script setup lang="ts">
import type { CardText, CardTextKey } from '../../../shared/font-settings';
import type { LanguageBarMode } from '../../../shared/language-bar';
import type { WallLocale } from '../../../shared/wall';
import type { PageCopy } from '~/types/wall-content';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import WallPageCopy from '~/components/wall/WallPageCopy.vue';
import { getColumnLayout, installationLayout } from '~/data/installation-layout';
import { getColumnPages, WALL_CONFIG } from '~/data/wall-config';
import { openCardTextTop, TEXT_INSET } from '~/utils/open-card-text';
import { cardTextKey } from '../../../shared/font-settings';
import { languageGeometry } from '../../../shared/language-bar';
import { WALL_LOCALES } from '../../../shared/wall';

/**
 * Fit check for Dashboard → Font: renders every page (and rotating part) of every card in every
 * language, invisibly, in the text box of the tallest open card (logical px at 1 px), with the
 * draft size range, exactly as the wall sizes it. Reports per card the smallest size used (and
 * where) and the largest; a smallest size below `min` means a page does not fit even at `min`.
 */
export interface CardFit { low: number; page: number; locale: WallLocale; high: number }

const props = defineProps<{
  cards: Record<CardTextKey, CardText>;
  showPages: boolean;
  offsetY: number;
  /** Dashboard → Wall "Scroll teks". */
  scrollText: boolean;
  /** The bottom close pill is shown, so open cards stop at the idle frame's bottom (as in scroll mode). */
  frameBottomCards: boolean;
  languageBar: LanguageBarMode;
}>();
const emit = defineEmits<{ result: [fits: Partial<Record<CardTextKey, CardFit>>] }>();

interface Probe { id: string; key: CardTextKey; page: number; locale: WallLocale; copy: PageCopy; width: number; height: number; scroll: boolean }

const probes = computed<Probe[]>(() => WALL_CONFIG.columns.flatMap((column) => {
  const card = getColumnLayout(column.id).active;
  const contents = column.type === 'expandable'
    ? (column.subItems ?? []).map(sub => ({ key: cardTextKey(column.key, sub.key), pages: getColumnPages(column, sub.key, props.scrollText) }))
    : [{ key: cardTextKey(column.key, ''), pages: getColumnPages(column, '', props.scrollText) }];
  // Scrolling text keeps its largest size, so it always fits.
  const scroll = props.scrollText;
  return contents.flatMap(({ key, pages }) => {
    if (!key)
      return [];
    const top = openCardTextTop(card, pages, props.showPages);
    const width = card.card.width - TEXT_INSET.left - TEXT_INSET.right;
    // Tallest card bottom: the idle frame's bottom when the bottom close pill shows, else y 1312 on screen.
    const frame = getColumnLayout(column.id).card;
    const bottom = props.frameBottomCards
      ? frame.y + frame.height + languageGeometry(getColumnLayout(column.id), props.languageBar).extend
      : installationLayout.visual.openCardMaxBottom - props.offsetY;
    const height = bottom - card.card.y - top - TEXT_INSET.bottom;
    return pages.flatMap((page, index) => WALL_LOCALES.flatMap((locale) => {
      const copy = page.i18n[locale];
      // Each rotating part on its own, since only one shows at a time.
      const parts = copy.parts?.length ? copy.parts.map(blocks => ({ ...copy, blocks, parts: undefined })) : [copy];
      return parts.map((part, partIndex) => ({ id: `${key}-${index}-${locale}-${partIndex}`, key, page: index, locale, copy: part, width, height, scroll }));
    }));
  });
}));

const root = ref<HTMLElement | null>(null);
let observer: MutationObserver | undefined;
let timer: ReturnType<typeof setTimeout> | undefined;

function measure() {
  const fits: Partial<Record<CardTextKey, CardFit>> = {};
  root.value?.querySelectorAll<HTMLElement>('[data-probe]').forEach((box) => {
    const probe = probes.value.find(item => item.id === box.dataset.probe);
    const scale = Number(box.querySelector<HTMLElement>('[data-copy-scale]')?.dataset.copyScale ?? 1);
    if (!probe)
      return;
    const size = Math.round(scale * props.cards[probe.key].min * 10) / 10;
    const fit = fits[probe.key];
    if (!fit)
      fits[probe.key] = { low: size, page: probe.page, locale: probe.locale, high: size };
    else if (size < fit.low)
      Object.assign(fit, { low: size, page: probe.page, locale: probe.locale });
    if (fit && size > fit.high)
      fit.high = size;
  });
  emit('result', fits);
}
// Fit runs after render, fonts, and logo loads; settle before reporting.
function schedule() {
  clearTimeout(timer);
  timer = setTimeout(measure, 120);
}

onMounted(() => {
  observer = new MutationObserver(schedule);
  if (root.value)
    observer.observe(root.value, { attributes: true, attributeFilter: ['data-copy-scale'], subtree: true, childList: true });
  document.fonts?.ready.then(schedule);
  schedule();
});
onBeforeUnmount(() => {
  observer?.disconnect();
  clearTimeout(timer);
});
</script>

<template>
  <div
    ref="root" aria-hidden="true" inert
    class="pointer-events-none invisible fixed left-0 top-0 -z-10 overflow-hidden"
    style="--wall-x: 1px; --wall-y: 1px; --wall-u: 1px; width: 1px; height: 1px"
  >
    <div v-for="probe in probes" :key="probe.id" class="absolute left-0 top-0" :data-probe="probe.id" :style="{ width: `${probe.width}px`, height: `${probe.height}px` }">
      <WallPageCopy
        class="absolute inset-0 overflow-hidden" :copy="probe.copy" :locale="probe.locale"
        :min="cards[probe.key].min" :max="cards[probe.key].max" :limit="probe.height" :scroll="probe.scroll"
      />
    </div>
  </div>
</template>
