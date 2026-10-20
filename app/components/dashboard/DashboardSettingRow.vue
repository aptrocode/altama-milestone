<script setup lang="ts">
import { onBeforeUnmount, ref, useId, watch } from 'vue';

/**
 * One dashboard setting: title, a one-line hint, optional details in a "?" tooltip (shown on
 * hover; a click or tap pins it open and lights the "?" until clicked again, Escape, or a click
 * elsewhere), a "Default: …" chip that resets a changed value, and the control on the right. `nested`
 * rows belong to the setting above them (e.g. Auto slide under Tombol slider).
 */
/** One tooltip paragraph: plain text, or a bold term followed by its explanation. */
export type HelpLine = string | { term: string; text: string };

defineProps<{
  title: string;
  hint?: string;
  help?: HelpLine[];
  /** The value differs from its default; `defaultLabel` names that default (e.g. "Compact", "30 s"). */
  changed?: boolean;
  defaultLabel?: string;
  nested?: boolean;
}>();
defineEmits<{ reset: [] }>();
const helpId = useId();
const pinned = ref(false);
const helpRoot = ref<HTMLElement | null>(null);

function closeOnOutside(event: PointerEvent) {
  if (!helpRoot.value?.contains(event.target as Node))
    pinned.value = false;
}
function closeOnEscape(event: KeyboardEvent) {
  if (event.key === 'Escape')
    pinned.value = false;
}
function listen(on: boolean) {
  const method = on ? 'addEventListener' : 'removeEventListener';
  document[method]('pointerdown', closeOnOutside as EventListener);
  document[method]('keydown', closeOnEscape as EventListener);
}
watch(pinned, listen);
onBeforeUnmount(() => listen(false));
</script>

<template>
  <div
    class="flex flex-wrap items-center gap-x-4 gap-y-2 py-3.5"
    :class="nested ? 'ml-3 border-l-2 border-wall-glow/40 pl-4 sm:ml-5' : ''"
  >
    <div class="min-w-0 flex-1 basis-52">
      <div class="flex items-center gap-2">
        <p class="font-bold text-white" :class="nested ? 'text-[0.95rem]' : ''">
          {{ title }}
        </p>
        <span v-if="help" ref="helpRoot" class="group/help relative inline-flex">
          <button
            type="button" :aria-label="`Penjelasan ${title}`" :aria-describedby="helpId" :aria-expanded="pinned"
            class="grid size-5 cursor-help place-items-center rounded-full text-xs font-bold ring-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wall-glow"
            :class="pinned ? 'bg-wall-glow text-[#06124f] ring-wall-glow shadow-[0_0_10px_rgba(102,204,255,0.7)]' : 'text-sky-100/70 ring-white/25 hover:bg-white/10 hover:text-white'"
            @click="pinned = !pinned"
          >
            ?
          </button>
          <span
            :id="helpId" role="tooltip"
            class="pointer-events-none absolute top-full left-1/2 z-30 mt-2 w-80 max-w-[85vw] -translate-x-1/2 space-y-2.5 rounded-xl bg-[#0a1150] px-4 py-3 text-sm leading-snug font-normal text-sky-50 shadow-[0_8px_24px_rgba(2,6,40,0.6)] ring-1 ring-wall-glow/40 transition duration-150 group-hover/help:visible group-hover/help:translate-y-0 group-hover/help:opacity-100 sm:left-0 sm:translate-x-0"
            :class="pinned ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-1 opacity-0'"
          >
            <span v-for="(line, index) in help" :key="index" class="block" :class="typeof line === 'string' ? 'text-sky-100/75' : ''">
              <template v-if="typeof line === 'string'">{{ line }}</template>
              <template v-else>
                <span class="block font-bold text-white">{{ line.term }}</span>
                <span class="block text-sky-100/80">{{ line.text }}</span>
              </template>
            </span>
          </span>
        </span>
        <button
          v-if="changed" type="button"
          class="flex items-center gap-1 rounded-full bg-amber-300/10 px-2 py-0.5 text-xs text-amber-200 ring-1 ring-amber-300/30 hover:bg-amber-300/20 hover:text-white"
          :title="`Bukan pengaturan bawaan. Klik untuk kembali ke ${defaultLabel ?? 'default'}.`"
          :aria-label="`Kembalikan ${title} ke default${defaultLabel ? ` (${defaultLabel})` : ''}`" @click="$emit('reset')"
        >
          <svg viewBox="0 0 24 24" class="size-3" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />
          </svg>
          Default: {{ defaultLabel ?? '—' }}
        </button>
      </div>
      <p v-if="hint" class="mt-0.5 text-sm text-sky-100/60">
        {{ hint }}
      </p>
    </div>
    <slot />
  </div>
</template>
