<script setup lang="ts">
import type { CardText, CardTextKey } from '../../../shared/font-settings';
import type { WallLocale } from '../../../shared/wall';
import type { PageCopy } from '~/types/wall-content';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import WallPageCopy from '~/components/wall/WallPageCopy.vue';
import { getColumnLayout, installationLayout } from '~/data/installation-layout';
import { WALL_CONFIG } from '~/data/wall-config';
import { openCardTextTop, TEXT_INSET } from '~/utils/open-card-text';
import { cardTextKey } from '../../../shared/font-settings';
import { WALL_LOCALES } from '../../../shared/wall';

/**
 * Fit check for Dashboard → Font: renders every page (and rotating part) of every card in every
 * language, invisibly, in the text box of the tallest open card (logical px at 1 px), with the
 * draft size and fill. A page whose text still shrinks there (`data-copy-scale` < 1) is too large
 * for its card: the wall would show it smaller than set. Reports the smallest scale per card.
 */
export interface CardFit { scale: number; page: number; locale: WallLocale }

const props = defineProps<{ cards: Record<CardTextKey, CardText>; showPages: boolean; offsetY: number }>();
const emit = defineEmits<{ result: [fits: Partial<Record<CardTextKey, CardFit>>] }>();

interface Probe { id: string; key: CardTextKey; page: number; locale: WallLocale; copy: PageCopy; width: number; height: number }

const probes = computed<Probe[]>(() => WALL_CONFIG.columns.flatMap((column) => {
  const card = getColumnLayout(column.id).active;
  const contents = column.type === 'expandable'
    ? (column.subItems ?? []).map(sub => ({ key: cardTextKey(column.key, sub.key), pages: sub.pages }))
    : [{ key: cardTextKey(column.key, ''), pages: column.pages ?? [] }];
  return contents.flatMap(({ key, pages }) => {
    if (!key)
      return [];
    const top = openCardTextTop(card, pages, props.showPages);
    const width = card.card.width - TEXT_INSET.left - TEXT_INSET.right;
    const height = installationLayout.visual.openCardMaxBottom - props.offsetY - card.card.y - top - TEXT_INSET.bottom;
    return pages.flatMap((page, index) => WALL_LOCALES.flatMap((locale) => {
      const copy = page.i18n[locale];
      // Each rotating part on its own, since only one shows at a time.
      const parts = copy.parts?.length ? copy.parts.map(blocks => ({ ...copy, blocks, parts: undefined })) : [copy];
      return parts.map((part, partIndex) => ({ id: `${key}-${index}-${locale}-${partIndex}`, key, page: index, locale, copy: part, width, height }));
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
    const best = fits[probe.key];
    if (!best || scale < best.scale)
      fits[probe.key] = { scale, page: probe.page, locale: probe.locale };
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
        :fill="cards[probe.key].fill" :size="cards[probe.key].size"
      />
    </div>
  </div>
</template>
