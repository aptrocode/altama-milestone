<script setup lang="ts">
import type { WallLocale } from '../../../shared/wall';
import type { BulletItem, MediaAsset, PageCopy } from '~/types/wall-content';
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { BASE_BODY_SIZE } from '../../../shared/font-settings';

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
const props = defineProps<{
  copy: PageCopy;
  locale: WallLocale;
  active?: boolean;
  /** Body size range in logical px (Dashboard → Font, per card); default 18. */
  min?: number;
  max?: number;
  /** Height of the tallest text box in CSS px (the open card's limit); default: the parent's height. */
  limit?: number;
  /** Trial (Dashboard → Wall "Scroll teks"): keep the `max` size and scroll the text vertically instead of shrinking it. */
  scroll?: boolean;
}>();
/** Content height at the chosen size in CSS px; the open card grows to fit the visible page. */
const emit = defineEmits<{ natural: [px: number] }>();

// Size: the largest size from `max` down to `min` (1 % steps) whose content fits the tallest text
// box; the card then grows to that content. Only a page that does not fit even at `min` keeps
// shrinking (down to 65 % of `min`) instead of being clipped; Dashboard → Font flags it.
const MIN_SCALE = 0.65;
const root = ref<HTMLElement | null>(null);
/** The text box (fixed size); the content (`root`) scrolls inside it in scroll mode. */
const scroller = ref<HTMLElement | null>(null);
/** Size relative to `min` (`--copy-base` is `min`, so `max` is a scale above 1). */
const scale = ref(1);
const minSize = computed(() => props.min ?? BASE_BODY_SIZE);
const maxScale = computed(() => Math.max(1, (props.max ?? minSize.value) / minSize.value));
let observer: ResizeObserver | undefined;
let lastNatural = -1;
let partsNatural = 0;

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
  const limit = props.limit || scroller.value?.clientHeight || element.clientHeight;
  let next = maxScale.value;
  element.style.setProperty('--copy-scale', String(next));
  // Measured strictly, so the text never touches or crosses the card edge. Scrolling text keeps `max`.
  while (!props.scroll && contentBottom(element) > limit - 1 && next > MIN_SCALE) {
    next = Math.max(MIN_SCALE, Math.ceil(next * 100 - 1.000001) / 100);
    element.style.setProperty('--copy-scale', String(next));
  }
  scale.value = next;
  // Rotating parts report the tallest part seen, so the card does not jump back between parts.
  const natural = Math.max(contentBottom(element), props.copy.parts ? partsNatural : 0);
  if (props.copy.parts)
    partsNatural = natural;
  if (Math.abs(natural - lastNatural) > 0.5) {
    lastNatural = natural;
    emit('natural', natural);
  }
  nextTick(updateScroll);
}

// Measured synchronously after render (not in requestAnimationFrame, which a hidden tab skips).
onMounted(() => {
  fit();
  document.fonts?.ready.then(fit);
  observer = new ResizeObserver(fit);
  if (scroller.value)
    observer.observe(scroller.value);
});
// A new size range or limit changes the content height, which the ResizeObserver cannot see.
watch(() => [props.copy, props.locale, props.min, props.max, props.limit, props.scroll], () => {
  partsNatural = 0;
  nextTick(fit);
});

// Scroll mode: the text box scrolls with the mouse wheel, or by dragging (touch, mouse, or a
// TouchDesigner drag), since the wall turns native touch scrolling off. A fade, a thin bar, and a
// bouncing chevron show that more text follows; every time the page shows it starts at the top.
const view = reactive({ top: 0, height: 0, content: 0 });
const overflows = computed(() => !!props.scroll && view.content > view.height + 1);
const atEnd = computed(() => view.top + view.height >= view.content - 2);
const bar = computed(() => ({
  height: `${Math.max(12, (view.height / Math.max(1, view.content)) * 100)}%`,
  top: `${(view.top / Math.max(1, view.content)) * 100}%`,
}));
function updateScroll() {
  const box = scroller.value;
  if (!box)
    return;
  view.top = box.scrollTop;
  view.height = box.clientHeight;
  // The content's own bottom: scrollHeight also counts glyph and animation overflow, which would
  // show the scroll cue for text that already fits.
  view.content = root.value ? contentBottom(root.value) : box.scrollHeight;
}
let drag: { id: number; y: number; top: number } | undefined;
function dragStart(event: PointerEvent) {
  if (!props.scroll || !scroller.value)
    return;
  drag = { id: event.pointerId, y: event.clientY, top: scroller.value.scrollTop };
  scroller.value.setPointerCapture?.(event.pointerId);
}
function dragMove(event: PointerEvent) {
  if (drag?.id === event.pointerId && scroller.value)
    scroller.value.scrollTop = drag.top - (event.clientY - drag.y);
}
function dragEnd(event: PointerEvent) {
  if (drag?.id === event.pointerId)
    drag = undefined;
}
watch(() => [props.active, props.copy, props.scroll], () => nextTick(() => {
  if (scroller.value)
    scroller.value.scrollTop = 0;
  updateScroll();
}));

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
  <div>
    <div
      ref="scroller" class="absolute inset-0"
      :class="scroll ? 'overflow-y-auto overscroll-contain cursor-grab pr-[calc(14*var(--wall-x))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden' : 'overflow-hidden'"
      @scroll="updateScroll" @pointerdown="dragStart" @pointermove="dragMove" @pointerup="dragEnd" @pointercancel="dragEnd"
    >
      <div
        ref="root" class="relative grid content-start gap-[calc(12*var(--wall-y)*var(--copy-base,1)*var(--copy-scale,1))] font-medium text-[length:calc(18*var(--wall-u)*var(--copy-base,1)*var(--copy-scale,1))]"
        :style="{ '--copy-scale': scale, '--copy-base': minSize / BASE_BODY_SIZE }" :data-copy-scale="scale"
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
    </div>
    <template v-if="overflows">
      <div v-if="view.top > 1" class="pointer-events-none absolute inset-x-0 top-0 h-[calc(28*var(--wall-y))] bg-linear-to-b from-[#040c55] to-transparent" aria-hidden="true" />
      <div v-if="!atEnd" class="pointer-events-none absolute inset-x-0 bottom-0 flex h-[calc(72*var(--wall-y))] items-end justify-center bg-linear-to-t from-[#040c55] to-transparent" aria-hidden="true">
        <span v-if="view.top < 2" class="text-[length:calc(52*var(--wall-u))] leading-none text-wall-glow motion-safe:animate-bounce">⌄</span>
      </div>
      <div class="pointer-events-none absolute right-0 inset-y-[calc(4*var(--wall-y))] w-[calc(4*var(--wall-x))] rounded-full bg-white/10" aria-hidden="true">
        <div class="absolute inset-x-0 rounded-full bg-wall-glow/80" :style="bar" />
      </div>
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
