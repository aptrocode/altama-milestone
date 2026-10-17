<script setup lang="ts">
import type { ColumnId, ColumnSnapshot, WallAction } from '../../../shared/wall';
import type { ColumnConfig } from '~/data/wall-config';
import { computed } from 'vue';
import WallCarousel from '~/components/wall/WallCarousel.vue';
import WallColumnPill from '~/components/wall/WallColumnPill.vue';
import WallHoldButton from '~/components/wall/WallHoldButton.vue';
import WallLanguageSwitcher from '~/components/wall/WallLanguageSwitcher.vue';
import { getColumnLayout, installationLayout, rectStyle } from '~/data/installation-layout';
import { getColumnContent } from '~/data/wall-config';
import { WALL_COPY } from '~/data/wall-copy';

const props = defineProps<{ column: ColumnConfig; snapshot: ColumnSnapshot; copy: { label: string; activeLabel: string } }>();
const emit = defineEmits<{ action: [action: WallAction]; activity: [id: ColumnId] }>();

const geometry = computed(() => getColumnLayout(props.column.id));
const visual = installationLayout.visual;
const idle = computed(() => props.snapshot.phase === 'idle');
const content = computed(() => getColumnContent(props.column, props.snapshot.subItem));
const tiles = computed(() => (geometry.value.subItems || []).map(tile => ({
  tile,
  sub: props.column.subItems!.find(sub => sub.key === tile.key)!,
})));
const openSubItem = computed(() => props.column.type === 'expandable' && !idle.value
  ? props.column.subItems?.find(sub => sub.key === props.snapshot.subItem)
  : undefined);
// Each column moves only its own title: inside the idle frame, or above the open card.
const pillStyle = computed(() => rectStyle(idle.value ? visual.idlePill : visual.activePill));
const card = computed(() => geometry.value.card);
const artworkStyle = computed(() => rectStyle(visual.artwork, { x: 0, y: card.value.y }));

function act(action: WallAction) {
  emit('action', action);
}
</script>

<template>
  <section
    class="wall-column absolute text-wall-ink" :style="rectStyle(geometry.section)"
    :data-col="column.id" :data-phase="snapshot.phase" :lang="snapshot.locale" :aria-label="copy.label"
    @pointerdown.capture="$emit('activity', column.id)" @keydown.capture="$emit('activity', column.id)"
  >
    <Transition
      enter-active-class="transition duration-500 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100"
      leave-active-class="transition duration-300 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0"
    >
      <div
        v-if="!idle" class="wall-rails pointer-events-none absolute -inset-x-[calc(8*var(--wall-x))]"
        :style="{ top: `calc(${visual.rail.y} * var(--wall-y))`, height: `calc(${visual.rail.height} * var(--wall-y))` }" aria-hidden="true"
      >
        <span class="absolute inset-y-0 left-0 w-[calc(3*var(--wall-x))] bg-linear-to-b from-transparent via-wall-glow/70 to-transparent shadow-[0_0_calc(12*var(--wall-x))_rgba(102,204,255,0.7)]" />
        <span class="absolute inset-y-0 right-0 w-[calc(3*var(--wall-x))] bg-linear-to-b from-transparent via-wall-glow/70 to-transparent shadow-[0_0_calc(12*var(--wall-x))_rgba(102,204,255,0.7)]" />
      </div>
    </Transition>

    <Transition
      enter-active-class="transition duration-300 ease-out delay-150" enter-from-class="opacity-0" enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0"
    >
      <div
        v-if="idle" class="wall-frame absolute [border-radius:calc(14*var(--wall-x))/calc(14*var(--wall-y))] bg-[#0a1a80]/35 ring-2 ring-wall-glow/80 shadow-[0_0_calc(20*var(--wall-x))_rgba(80,190,255,0.6),inset_0_0_calc(24*var(--wall-x))_rgba(80,190,255,0.25)]"
        :style="rectStyle(card, geometry.section)"
      >
        <WallHoldButton
          v-if="geometry.main" class="absolute inset-0 [border-radius:inherit] hover:bg-white/5"
          :outline="geometry.main" :radius="14" :aria-label="copy.label" data-sensor-action="main"
          @activate="act({ type: 'main', columnId: column.id })"
        >
          <img
            v-if="column.illustration" :src="column.illustration.src" alt=""
            class="absolute object-contain pointer-events-none" :style="artworkStyle"
          >
        </WallHoldButton>
        <WallHoldButton
          v-for="{ tile, sub } in tiles" :key="tile.key"
          class="absolute overflow-hidden [border-radius:calc(10*var(--wall-x))/calc(10*var(--wall-y))] ring-1 ring-white/30 shadow-[0_0_calc(10*var(--wall-x))_rgba(80,190,255,0.35)]"
          :class="column.captionTiles ? 'bg-[#1530b8]/70' : ''"
          :style="rectStyle(tile, card)" :outline="tile" :radius="10" :aria-label="sub.i18n[snapshot.locale].label"
          data-sensor-action="subItem" :data-sub-item="tile.key"
          @activate="act({ type: 'subItem', columnId: column.id, subItemId: tile.key })"
        >
          <span v-if="column.captionTiles" class="absolute inset-x-0 top-[calc(8*var(--wall-y))] z-10 text-[length:calc(30*var(--wall-x))] font-extrabold uppercase tracking-wide text-white text-center leading-none drop-shadow-[0_0_calc(8*var(--wall-x))_rgba(0,0,60,0.8)]">
            {{ sub.i18n[snapshot.locale].label }}
          </span>
          <img
            :src="sub.image.src" alt="" class="absolute inset-x-0 bottom-0 w-full object-cover pointer-events-none"
            :class="column.captionTiles ? 'h-[78%]' : 'h-full'"
          >
        </WallHoldButton>
        <WallLanguageSwitcher
          class="absolute z-20" :style="rectStyle(geometry.languageBar, card)"
          :column-id="column.id" :locale="snapshot.locale" :bar="geometry.languageBar" :targets="geometry.languages"
          @select="act({ type: 'language', columnId: column.id, locale: $event })"
        />
      </div>
    </Transition>

    <WallColumnPill
      class="absolute z-10 transition-[top] duration-500 ease-out motion-reduce:transition-none" :class="idle ? 'pointer-events-none' : ''"
      :style="pillStyle" :icon="column.icon" :label="copy.label"
    />

    <Transition
      enter-active-class="transition duration-300 ease-out delay-200" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0"
    >
      <div v-if="openSubItem" class="absolute flex items-center justify-center pointer-events-none" :style="rectStyle(visual.subtitle)">
        <img
          v-if="openSubItem.wordmark" :src="openSubItem.wordmark.src" :alt="copy.activeLabel"
          class="max-w-[calc(300*var(--wall-x))] h-[calc(62*var(--wall-y))] object-contain [border-radius:calc(8*var(--wall-x))/calc(8*var(--wall-y))]"
        >
        <span v-else class="text-[length:calc(32*var(--wall-x))] font-extrabold uppercase tracking-wide text-white drop-shadow-[0_0_calc(12*var(--wall-x))_rgba(102,204,255,0.9)]">
          {{ copy.activeLabel }}
        </span>
      </div>
    </Transition>

    <Transition
      enter-active-class="transition duration-300 ease-out delay-150" enter-from-class="opacity-0 translate-y-3" enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0"
    >
      <WallCarousel
        v-if="!idle" class="absolute" :style="rectStyle(geometry.active.card, geometry.section)"
        :column-id="column.id" :content="content" :locale="snapshot.locale" :photo="snapshot.photo" :page="snapshot.page"
        :geometry="geometry.active" @action="act"
      />
    </Transition>

    <Transition
      enter-active-class="transition duration-300 delay-300" enter-from-class="opacity-0 scale-75" enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0"
    >
      <button
        v-if="!idle" type="button"
        class="wall-back absolute z-20 flex items-center justify-center rounded-full bg-[#0b1a78] ring-2 ring-[#bfe8ff] shadow-[0_0_calc(12*var(--wall-x))_rgba(102,204,255,0.8)] text-white text-[length:calc(20*var(--wall-x))] hover:bg-red-500 cursor-pointer"
        :style="rectStyle(geometry.active.back, geometry.section)"
        :aria-label="WALL_COPY[snapshot.locale].back" data-sensor-action="back"
        @click="act({ type: 'back', columnId: column.id })"
      >
        <span aria-hidden="true">✕</span>
      </button>
    </Transition>
  </section>
</template>
