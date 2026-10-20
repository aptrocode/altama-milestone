<script setup lang="ts">
import type { WallLocale } from '../../../shared/wall';
import type { BulletItem, MediaAsset, PageCopy } from '~/types/wall-content';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useSettingsStore } from '~/stores/settings';

/**
 * Open-card text. One typographic system for every column (see docs/style.md, "Card copy"):
 * - paragraph: white, medium weight;
 * - `bullets`: each item has a glow dot; the lead is a small uppercase glow label and the
 *   text sits under it, aligned with the label (never under the marker); a lead without text is
 *   plain body text;
 * - `inline` bullets: a compact two-column fact table (label | value) with hairline dividers;
 * - `numbered`: glow numbers in a fixed column with the text aligned beside them.
 * Every paragraph and list item fades up in reading order (top to bottom) whenever the page
 * becomes the visible one: when the card opens and on every page switch.
 */
const props = defineProps<{ copy: PageCopy; locale: WallLocale; active?: boolean; /** Grow the text until it fills the available height. */ fill?: boolean; /** Text size relative to the body size. */ base?: number }>();
/** Content height at full size in CSS px; the open card grows to fit the visible page. */
const emit = defineEmits<{ natural: [px: number] }>();

// Body text is the dashboard body size (default 18 logical px). The card grows with its content first (WallOpenCard); a page that
// still overflows the tallest card (y 1312) shrinks in small steps (down to 80%) instead of being clipped.
const MIN_SCALE = 0.65;
/** Upper bound when a page fills the card (`fill`): short pages grow at most this much. */
const MAX_FILL = 2.5;
const root = ref<HTMLElement | null>(null);
const scale = ref(1);
let observer: ResizeObserver | undefined;
let lastNatural = -1;

/** Bottom of the last block in CSS px (the content's own height, unlike scrollHeight). */
function contentBottom(element: HTMLElement) {
  return [...element.children].reduce((bottom, child) => {
    const box = child as HTMLElement;
    return Math.max(bottom, box.offsetTop + box.offsetHeight);
  }, 0);
}

function fit() {
  const element = root.value;
  if (!element)
    return;
  let next = 1;
  element.style.setProperty('--copy-scale', '1');
  const natural = [...element.children].reduce((bottom, child) => {
    const box = child as HTMLElement;
    return Math.max(bottom, box.offsetTop + box.offsetHeight);
  }, 0);
  if (Math.abs(natural - lastNatural) > 0.5) {
    lastNatural = natural;
    emit('natural', natural);
  }
  const available = element.parentElement?.clientHeight || element.clientHeight;
  while (element.scrollHeight > available + 1 && next > MIN_SCALE) {
    next = Math.max(MIN_SCALE, Math.round((next - 0.02) * 100) / 100);
    element.style.setProperty('--copy-scale', String(next));
  }
  // Fill: grow in 1 % steps while the page still fits, then keep the last size that fit. The card
  // keeps the height of the page at full size (reported above), so growing never grows the card.
  if ((props.fill || props.copy.fill) && next >= 1) {
    while (next < MAX_FILL) {
      const candidate = Math.min(MAX_FILL, Math.round((next + 0.01) * 100) / 100);
      element.style.setProperty('--copy-scale', String(candidate));
      // Measure the content itself (scrollHeight never drops below the box), strictly, so a filled
      // page never touches or crosses the card edge.
      if (contentBottom(element) > available - 1)
        break;
      next = candidate;
    }
    element.style.setProperty('--copy-scale', String(next));
  }
  scale.value = next;
}

// Measured synchronously after render (not in requestAnimationFrame, which a hidden tab skips).
onMounted(() => {
  fit();
  document.fonts?.ready.then(fit);
  observer = new ResizeObserver(fit);
  if (root.value) {
    observer.observe(root.value);
    if (root.value.parentElement)
      observer.observe(root.value.parentElement);
  }
});
const settings = useSettingsStore();
// A new dashboard body size changes the content height, which the ResizeObserver cannot see.
watch(() => [props.copy, props.locale, props.base, settings.fonts.bodySize], () => nextTick(fit));

// Rotating parts (`copy.parts`): no buttons, the next part shows every `partSeconds` while this page
// is visible, from the first part again each time it becomes visible. The timer is this
// component's resource and stops with it.
const part = ref(0);
const shownBlocks = computed(() => props.copy.parts?.[part.value] ?? props.copy.blocks);
let partTimer: ReturnType<typeof setInterval> | undefined;
watch(() => [props.active, props.copy] as const, ([active]) => {
  clearInterval(partTimer);
  partTimer = undefined;
  part.value = 0;
  const parts = props.copy.parts?.length ?? 0;
  if (active && parts > 1) {
    partTimer = setInterval(() => {
      part.value = (part.value + 1) % parts;
    }, (props.copy.partSeconds ?? 10) * 1000);
  }
}, { immediate: true });
watch(part, () => nextTick(() => {
  fit();
  replay();
}));

onBeforeUnmount(() => {
  observer?.disconnect();
  clearInterval(partTimer);
});

// Reading-order index of every paragraph / list item, so delays run top to bottom across blocks.
const revealStart = computed(() => {
  let next = 0;
  return shownBlocks.value.map((block) => {
    const start = next;
    next += typeof block === 'string' ? 1 : 'bullets' in block ? block.bullets.length : block.numbered.length;
    return start;
  });
});
/** An item's logos (`image` and/or `images`), shown at the right edge of its row. */
const logos = (item: BulletItem): MediaAsset[] => [...(item.image ? [item.image] : []), ...(item.images ?? [])];
/** A single logo sits beside the text unless the item asks for it below. */
const logoBeside = (item: BulletItem) => logos(item).length === 1 && !item.logosBelow;
const reveal = (blockIndex: number, itemIndex = 0) => ({ '--reveal-i': revealStart.value[blockIndex]! + itemIndex });

// Restart the reveal each time this page becomes the visible one (open, page tab, language).
function replay() {
  const element = root.value;
  if (!element)
    return;
  element.classList.remove('copy-reveal');
  void element.offsetWidth;
  element.classList.add('copy-reveal');
}
onMounted(() => {
  if (props.active)
    replay();
});
watch(() => [props.active, props.copy], () => {
  if (props.active)
    nextTick(replay);
});
</script>

<template>
  <div
    ref="root" class="grid content-start gap-[calc(12*var(--wall-y)*var(--copy-base,1)*var(--copy-scale,1))] font-medium text-[length:calc(var(--fs-body,18)*var(--wall-u)*var(--copy-base,1)*var(--copy-scale,1))]"
    :style="{ '--copy-scale': scale, '--copy-base': base ?? 1 }" :data-copy-scale="scale"
  >
    <template v-for="(block, index) in shownBlocks" :key="`${part}-${index}`">
      <p v-if="typeof block === 'string'" class="leading-[1.3] text-white/95" data-reveal :style="reveal(index)">
        {{ block }}
      </p>

      <dl
        v-else-if="'bullets' in block && block.inline"
        class="grid grid-cols-[auto_1fr] gap-x-[calc(12*var(--wall-x))] leading-[1.2] [&>dt]:border-white/12 [&>dd]:border-white/12 [&>dt:not(:first-child)]:border-t [&>dd:not(:nth-child(2))]:border-t"
      >
        <template v-for="(item, itemIndex) in block.bullets" :key="item.lead">
          <dt class="py-[calc(5*var(--wall-y))] text-[0.82em] font-bold uppercase tracking-[0.05em] text-wall-glow" data-reveal :style="reveal(index, itemIndex)">
            {{ item.lead }}
          </dt>
          <dd class="py-[calc(5*var(--wall-y))] font-semibold text-white" data-reveal :style="reveal(index, itemIndex)">
            {{ item.text }}
          </dd>
        </template>
      </dl>

      <ul v-else-if="'bullets' in block" class="grid gap-[calc(7*var(--wall-y)*var(--copy-scale,1))]">
        <li
          v-for="(item, itemIndex) in block.bullets" :key="item.lead" data-reveal :style="reveal(index, itemIndex)"
          class="grid min-w-0 items-center gap-x-[calc(10*var(--wall-x))]"
          :class="logoBeside(item) ? 'grid-cols-[minmax(0,1fr)_auto]' : 'grid-cols-[minmax(0,1fr)]'"
        >
          <!-- The dot belongs to the text block, so it stays on the first text line even when a
               taller logo centres the row. One logo sits in a fixed box at the right edge (so the
               logos of a list line up); several logos (e.g. marketplaces), or one wide logo marked
               `logosBelow`, sit under the text and always fit the card. -->
          <div class="relative min-w-0 pl-[calc(13*var(--wall-x))] before:absolute before:left-0 before:top-[0.36em] before:size-[calc(6*var(--wall-u))] before:rounded-full before:bg-wall-glow before:shadow-[0_0_calc(6*var(--wall-u))_rgba(102,204,255,0.8)]">
            <!-- A lead without text is the item itself, so it reads as body text rather than a label. -->
            <span
              class="block"
              :class="item.text ? 'text-[0.82em] font-bold uppercase leading-[1.15] tracking-[0.05em] text-wall-glow' : 'font-semibold leading-[1.25] text-white'"
            >{{ item.lead }}</span>
            <span v-if="item.text" class="mt-[calc(2*var(--wall-y)*var(--copy-scale,1))] block leading-[1.25] text-white">{{ item.text }}</span>
          </div>
          <div
            v-if="logoBeside(item)"
            class="flex w-[calc(78*var(--wall-x))] h-[calc(36*var(--wall-y))] items-center justify-center rounded-md bg-white/95 px-[calc(5*var(--wall-x))] py-[calc(3*var(--wall-y))] shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
          >
            <img :src="logos(item)[0]!.src" :alt="item.lead" class="max-h-full max-w-full object-contain" @load="fit">
          </div>
          <div
            v-else-if="logos(item).length === 1"
            class="mt-[calc(5*var(--wall-y)*var(--copy-scale,1))] pl-[calc(13*var(--wall-x))]"
          >
            <div class="w-full rounded-md bg-white px-[calc(8*var(--wall-x))] py-[calc(6*var(--wall-y))] shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
              <img :src="logos(item)[0]!.src" :alt="item.lead" class="block h-auto w-full object-contain" @load="fit">
            </div>
          </div>
          <div
            v-else-if="logos(item).length > 1"
            class="mt-[calc(5*var(--wall-y)*var(--copy-scale,1))] grid grid-cols-4 gap-[calc(5*var(--wall-x))] pl-[calc(13*var(--wall-x))]"
          >
            <div
              v-for="(logo, logoIndex) in logos(item)" :key="logoIndex"
              class="flex min-w-0 h-[calc(32*var(--wall-y))] items-center justify-center rounded-md bg-white px-[calc(4*var(--wall-x))] py-[calc(3*var(--wall-y))] shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
            >
              <img :src="logo.src" :alt="item.lead" class="max-h-full max-w-full object-contain" @load="fit">
            </div>
          </div>
        </li>
      </ul>

      <ol v-else class="grid gap-[calc(8*var(--wall-y))] [counter-reset:wall-step]">
        <li
          v-for="(item, itemIndex) in block.numbered" :key="item" data-reveal :style="reveal(index, itemIndex)"
          class="relative pl-[1.8em] leading-[1.25] text-white [counter-increment:wall-step] before:absolute before:left-0 before:top-0 before:font-display before:font-bold before:text-wall-glow before:content-[counter(wall-step,decimal-leading-zero)]"
        >
          {{ item }}
        </li>
      </ol>
    </template>
  </div>
</template>

<style scoped>
/* Vue scopes the keyframe name and this reference together; off under reduced motion. */
@media (prefers-reduced-motion: no-preference) {
  .copy-reveal [data-reveal] {
    animation: copy-reveal 460ms cubic-bezier(0.2, 0.7, 0.2, 1) both;
    animation-delay: calc(180ms + var(--reveal-i, 0) * 70ms);
  }
}

@keyframes copy-reveal {
  from {
    opacity: 0;
    transform: translateY(calc(10 * var(--wall-y, 1px)));
  }
  to {
    opacity: 1;
    transform: none;
  }
}
</style>
