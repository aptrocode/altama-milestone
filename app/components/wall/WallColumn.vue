<script setup lang="ts">
import type { ColumnId, ColumnSnapshot, WallAction } from '../../../shared/wall';
import type { ColumnConfig } from '~/data/wall-config';
import WallCarousel from '~/components/wall/WallCarousel.vue';
import WallHoldCue from '~/components/wall/WallHoldCue.vue';
import WallLanguageSwitcher from '~/components/wall/WallLanguageSwitcher.vue';
import { WALL_COPY } from '~/data/wall-copy';

defineProps<{ column: ColumnConfig; snapshot: ColumnSnapshot; copy: { label: string; activeLabel: string } }>();
defineEmits<{ action: [action: WallAction]; activity: [id: ColumnId] }>();
</script>

<template>
  <section
    class="wall-column flex-1 flex flex-col relative min-w-0 min-h-0" :data-col="column.id"
    :data-phase="snapshot.phase" :lang="snapshot.locale" :aria-label="copy.label"
    @pointerdown.capture="$emit('activity', column.id)" @keydown.capture="$emit('activity', column.id)"
  >
    <WallLanguageSwitcher
      :column-id="column.id" :locale="snapshot.locale"
      @select="$emit('action', { type: 'language', columnId: column.id, locale: $event })"
    />
    <div class="wall-panel flex-1 flex flex-col min-h-0">
      <button
        v-if="snapshot.phase === 'idle'" v-hold="() => $emit('action', { type: 'main', columnId: column.id })"
        type="button" class="laser-target idle-breathe flex-1 flex flex-col items-center justify-center gap-1.5 bg-gradient-to-b from-white via-slate-50 to-neutral-100 hover:to-emerald-50/50 border border-neutral-300/80 hover:border-emerald-500/60 rounded-xl text-neutral-900 font-extrabold uppercase text-center px-3 py-3 cursor-pointer relative shadow-xs"
        data-sensor-action="main"
      >
        <span class="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-1 shrink-0 shadow-xs ring-2 ring-emerald-600/20" aria-hidden="true">
          {{ column.id }}
        </span>
        <span class="w-full whitespace-nowrap overflow-hidden text-ellipsis text-[clamp(10px,1.1vw,18px)] font-black tracking-wide" :title="copy.label">{{ copy.label }}</span>
        <WallHoldCue :locale="snapshot.locale" />
      </button>

      <div v-else-if="snapshot.phase === 'submenu'" class="wall-submenu flex-1 flex flex-col min-h-0 bg-white rounded-xl overflow-hidden shadow-xs animate-kiosk-enter">
        <div class="wall-submenu-heading flex items-center justify-between bg-emerald-800 shrink-0">
          <span class="text-xs font-black text-white uppercase tracking-wide truncate">{{ copy.label }}</span>
          <button
            type="button" class="wall-back rounded-full bg-white/20 text-white hover:bg-red-500 cursor-pointer shrink-0"
            :aria-label="WALL_COPY[snapshot.locale].back" data-sensor-action="back"
            @click="$emit('action', { type: 'back', columnId: column.id })"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
        <button
          v-for="sub in column.subItems" :key="sub.key"
          v-hold="() => $emit('action', { type: 'subItem', columnId: column.id, subItemId: sub.key })"
          type="button" class="laser-target flex-1 min-h-0 flex flex-col items-center justify-center bg-white hover:bg-emerald-50/80 border-t border-neutral-200 font-bold uppercase text-center p-2.5 cursor-pointer relative"
          :class="{ '!bg-emerald-700 text-white': snapshot.subItem === sub.key }"
          data-sensor-action="subItem" :data-sub-item="sub.key"
        >
          <span class="w-full whitespace-nowrap overflow-hidden text-ellipsis text-[clamp(9px,0.9vw,14px)] font-black">
            {{ sub.i18n?.[snapshot.locale]?.label || sub.label }}
          </span>
          <WallHoldCue :locale="snapshot.locale" :selected="snapshot.subItem === sub.key" />
        </button>
      </div>

      <WallCarousel
        v-else :column="column" :locale="snapshot.locale" :slide="snapshot.slide" :label="copy.activeLabel"
        @action="$emit('action', $event)"
      />
    </div>
  </section>
</template>
