<script setup lang="ts">
import type { ColumnIcon } from '~/types/wall-content';
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import WallColumnIcon from '~/components/wall/WallColumnIcon.vue';
import { useSettingsStore } from '~/stores/settings';

/**
 * Column title pill. Size and weight come from the dashboard (Font); a word longer than the pill
 * (INFRASTRUKTUR at a large size or heavy weight) shrinks just that title until it fits, so no
 * font setting can clip a title.
 */
const props = defineProps<{ icon: ColumnIcon; label: string }>();

const MIN_FIT = 0.6;
const settings = useSettingsStore();
const title = ref<HTMLElement | null>(null);
let observer: ResizeObserver | undefined;

function fit() {
  const element = title.value;
  if (!element)
    return;
  let scale = 1;
  element.style.setProperty('--title-fit', '1');
  while (element.scrollWidth > element.clientWidth + 0.5 && scale > MIN_FIT) {
    scale = Math.round((scale - 0.02) * 100) / 100;
    element.style.setProperty('--title-fit', String(scale));
  }
}

onMounted(() => {
  fit();
  document.fonts?.ready.then(fit);
  observer = new ResizeObserver(fit);
  if (title.value)
    observer.observe(title.value);
});
watch(() => [props.label, settings.fonts.titleSize, settings.fonts.titleWeight], () => nextTick(fit));
onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <div
    class="wall-pill flex items-center gap-[calc(10*var(--wall-x))] pl-[calc(6*var(--wall-x))] pr-[calc(16*var(--wall-x))] [border-radius:calc(18*var(--wall-x))/calc(18*var(--wall-y))] bg-linear-to-b from-[#112a9c]/95 via-[#0a1a78]/95 to-[#071056]/95 ring-2 ring-wall-glow/70 shadow-[0_0_calc(18*var(--wall-x))_rgba(80,190,255,0.5),inset_0_calc(2*var(--wall-y))_calc(10*var(--wall-y))_rgba(255,255,255,0.12)]"
  >
    <span class="shrink-0 w-[calc(84*var(--wall-x))] h-[calc(84*var(--wall-y))] flex items-center justify-center rounded-full ring-3 ring-wall-glow bg-[#0b1a78] text-white shadow-[0_0_calc(16*var(--wall-x))_rgba(102,204,255,0.8),inset_0_0_calc(12*var(--wall-x))_rgba(102,204,255,0.45)]">
      <WallColumnIcon :icon="icon" class="w-[calc(46*var(--wall-x))] h-[calc(46*var(--wall-y))]" />
    </span>
    <h2 ref="title" class="flex-1 min-w-0 text-left font-display text-[length:calc(var(--fs-title,27)*var(--wall-u)*var(--title-fit,1))] [font-weight:var(--fw-title,700)] uppercase leading-[1.08] tracking-[0.01em] text-white text-balance drop-shadow-[0_0_calc(6*var(--wall-x))_rgba(102,204,255,0.5)]">
      {{ label }}
    </h2>
    <span class="pointer-events-none absolute right-0 bottom-0 w-[calc(54*var(--wall-x))] h-[calc(40*var(--wall-y))] bg-linear-to-tl from-sky-200/90 via-wall-glow/40 to-transparent [clip-path:polygon(100%_8%,100%_100%,6%_100%)] [border-bottom-right-radius:calc(18*var(--wall-x))_calc(18*var(--wall-y))]" aria-hidden="true" />
  </div>
</template>
