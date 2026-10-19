<script setup lang="ts">
import type { WallLocale } from '../../../shared/wall';
import type { PageCopy } from '~/types/wall-content';
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

/**
 * Open-card text. One typographic system for every column (see docs/style.md, "Card copy"):
 * - paragraph: white, medium weight;
 * - `bullets`: each item has a glow dot; the lead is a small uppercase glow label and the
 *   text sits under it, aligned with the label (never under the marker); a lead without text is
 *   plain body text;
 * - `inline` bullets: a compact two-column fact table (label | value) with hairline dividers;
 * - `numbered`: glow numbers in a fixed column with the text aligned beside them.
 */
const props = defineProps<{ copy: PageCopy; locale: WallLocale }>();
/** Content height at full size in CSS px; the open card grows to fit its tallest page. */
const emit = defineEmits<{ natural: [px: number] }>();

// Body text is 18 logical px. The card grows with its content first (WallOpenCard); a page that
// still overflows the tallest card shrinks in small steps (down to 80%) instead of being clipped.
const MIN_SCALE = 0.8;
const root = ref<HTMLElement | null>(null);
const scale = ref(1);
let observer: ResizeObserver | undefined;
let lastNatural = -1;

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
  while (element.scrollHeight > element.clientHeight + 1 && next > MIN_SCALE) {
    next = Math.max(MIN_SCALE, Math.round((next - 0.02) * 100) / 100);
    element.style.setProperty('--copy-scale', String(next));
  }
  scale.value = next;
}

// Measured synchronously after render (not in requestAnimationFrame, which a hidden tab skips).
onMounted(() => {
  fit();
  document.fonts?.ready.then(fit);
  observer = new ResizeObserver(fit);
  if (root.value)
    observer.observe(root.value);
});
watch(() => [props.copy, props.locale], () => nextTick(fit));
onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <div
    ref="root" class="grid content-start gap-[calc(12*var(--wall-y)*var(--copy-scale,1))] font-medium text-[length:calc(18*var(--wall-u)*var(--copy-scale,1))]"
    :style="{ '--copy-scale': scale }" :data-copy-scale="scale"
  >
    <template v-for="(block, index) in copy.blocks" :key="index">
      <p v-if="typeof block === 'string'" class="leading-[1.3] text-white/95">
        {{ block }}
      </p>

      <dl
        v-else-if="'bullets' in block && block.inline"
        class="grid grid-cols-[auto_1fr] gap-x-[calc(12*var(--wall-x))] leading-[1.2] [&>dt]:border-white/12 [&>dd]:border-white/12 [&>dt:not(:first-child)]:border-t [&>dd:not(:nth-child(2))]:border-t"
      >
        <template v-for="item in block.bullets" :key="item.lead">
          <dt class="py-[calc(5*var(--wall-y))] text-[0.82em] font-bold uppercase tracking-[0.05em] text-wall-glow">
            {{ item.lead }}
          </dt>
          <dd class="py-[calc(5*var(--wall-y))] font-semibold text-white">
            {{ item.text }}
          </dd>
        </template>
      </dl>

      <ul v-else-if="'bullets' in block" class="grid gap-[calc(9*var(--wall-y))]">
        <li
          v-for="item in block.bullets" :key="item.lead"
          class="relative pl-[calc(13*var(--wall-x))] before:absolute before:left-0 before:top-[0.36em] before:size-[calc(6*var(--wall-u))] before:rounded-full before:bg-wall-glow before:shadow-[0_0_calc(6*var(--wall-u))_rgba(102,204,255,0.8)]"
        >
          <!-- A lead without text is the item itself, so it reads as body text rather than a label. -->
          <span
            class="block"
            :class="item.text ? 'text-[0.82em] font-bold uppercase leading-[1.15] tracking-[0.05em] text-wall-glow' : 'font-semibold leading-[1.25] text-white'"
          >{{ item.lead }}</span>
          <span v-if="item.text" class="mt-[calc(2*var(--wall-y))] block leading-[1.25] text-white">{{ item.text }}</span>
        </li>
      </ul>

      <ol v-else class="grid gap-[calc(8*var(--wall-y))] [counter-reset:wall-step]">
        <li
          v-for="item in block.numbered" :key="item"
          class="relative pl-[calc(24*var(--wall-x))] leading-[1.25] text-white [counter-increment:wall-step] before:absolute before:left-0 before:top-0 before:font-display before:font-bold before:text-wall-glow before:content-[counter(wall-step,decimal-leading-zero)]"
        >
          {{ item }}
        </li>
      </ol>
    </template>
  </div>
</template>
