<script setup lang="ts">
import type { ColumnId, ColumnSnapshot, WallAction } from '../../../shared/wall';
import type { ColumnConfig } from '~/data/wall-config';
import { computed } from 'vue';
import WallCarousel from '~/components/wall/WallCarousel.vue';
import WallHoldButton from '~/components/wall/WallHoldButton.vue';
import WallHoldCue from '~/components/wall/WallHoldCue.vue';
import WallLanguageSwitcher from '~/components/wall/WallLanguageSwitcher.vue';
import { installationLayout } from '~/data/installation-layout';
import { WALL_COPY } from '~/data/wall-copy';

const props = defineProps<{ column: ColumnConfig; snapshot: ColumnSnapshot; copy: { label: string; activeLabel: string } }>();
defineEmits<{ action: [action: WallAction]; activity: [id: ColumnId] }>();
const geometry = computed(() => installationLayout.columns.find(item => item.id === props.column.id)!);
</script>

<template>
  <section
    class="wall-column relative isolate flex flex-col min-w-0 min-h-0 [border-radius:calc(14*var(--wall-x))/calc(14*var(--wall-y))] overflow-hidden shadow-md ring-1 ring-neutral-300/70 transition-colors duration-300"
    :class="snapshot.phase === 'idle' ? 'bg-kiosk-bg' : snapshot.phase === 'submenu' ? 'bg-white' : 'bg-[#153d31]'"
    :data-col="column.id" :data-phase="snapshot.phase" :lang="snapshot.locale" :aria-label="copy.label"
    @pointerdown.capture="$emit('activity', column.id)" @keydown.capture="$emit('activity', column.id)"
  >
    <div class="wall-panel relative h-full flex flex-col min-h-0 rounded-[inherit] overflow-hidden">
      <Transition
        mode="out-in"
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-[0.98]"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-[0.98]"
      >
        <WallHoldButton
          v-if="snapshot.phase === 'idle'"
          key="idle"
          class="flex-1 flex flex-col items-center justify-start rounded-[inherit] hover:bg-kiosk-hover text-slate-800 font-extrabold uppercase text-center px-[calc(16*var(--wall-x))] pt-[calc(135*var(--wall-y))] pb-[calc(110*var(--wall-y))]"
          :outline="geometry.main" :radius="14"
          data-sensor-action="main"
          @activate="$emit('action', { type: 'main', columnId: column.id })"
        >
          <div class="w-full h-[calc(60*var(--wall-y))] flex items-center justify-center">
            <span class="w-full text-[length:calc(26*var(--wall-x))] font-black tracking-normal leading-none whitespace-nowrap overflow-hidden text-ellipsis">{{ copy.label }}</span>
          </div>
          <div class="h-[calc(40*var(--wall-y))] mt-[calc(20*var(--wall-y))] flex items-center justify-center">
            <WallHoldCue :locale="snapshot.locale" />
          </div>
        </WallHoldButton>

        <div
          v-else-if="snapshot.phase === 'submenu'"
          key="submenu"
          class="wall-submenu flex-1 flex flex-col min-h-0"
        >
          <div class="wall-submenu-heading relative h-(--wall-heading-height-y) flex items-center justify-center px-[calc(52*var(--wall-x))] bg-emerald-800 shrink-0">
            <span class="text-center text-[length:calc(18*var(--wall-x))] font-black text-white uppercase tracking-wide leading-tight wrap-break-word">{{ copy.label }}</span>
            <button
              type="button" class="wall-back absolute top-(--wall-back-padding-y) right-(--wall-back-padding-x) w-(--wall-control-size-x) h-(--wall-control-size-y) flex items-center justify-center rounded-full bg-white/20 text-white text-[length:calc(20*var(--wall-x))] hover:bg-red-500 cursor-pointer"
              :aria-label="WALL_COPY[snapshot.locale].back" data-sensor-action="back"
              @click="$emit('action', { type: 'back', columnId: column.id })"
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>
          <WallHoldButton
            v-for="(sub, index) in column.subItems" :key="sub.key"
            class="flex-1 min-h-0 flex flex-col items-center justify-center gap-[calc(12*var(--wall-y))] border-t border-neutral-200 font-bold uppercase text-center px-[calc(24*var(--wall-x))] py-[calc(16*var(--wall-y))]"
            :outline="geometry.submenu!.items[index]!" :radius="index === column.subItems!.length - 1 ? 14 : 0" bottom-corners-only
            :class="snapshot.subItem === sub.key ? 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100' : 'bg-white text-slate-800 hover:bg-emerald-50/80'"
            data-sensor-action="subItem" :data-sub-item="sub.key"
            @activate="$emit('action', { type: 'subItem', columnId: column.id, subItemId: sub.key })"
          >
            <span class="w-full text-[length:calc(24*var(--wall-x))] font-black leading-tight text-balance wrap-break-word">
              {{ sub.i18n?.[snapshot.locale]?.label || sub.label }}
            </span>
            <WallHoldCue :locale="snapshot.locale" />
          </WallHoldButton>
        </div>

        <WallCarousel
          v-else
          key="carousel"
          :column="column" :locale="snapshot.locale" :slide="snapshot.slide" :label="copy.activeLabel"
          @action="$emit('action', $event)"
        />
      </Transition>
    </div>
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <WallLanguageSwitcher
        v-if="snapshot.phase === 'idle'"
        class="absolute z-20 bottom-(--wall-language-bottom-y) left-1/2 -translate-x-1/2"
        :column-id="column.id" :locale="snapshot.locale"
        @select="$emit('action', { type: 'language', columnId: column.id, locale: $event })"
      />
    </Transition>
  </section>
</template>
