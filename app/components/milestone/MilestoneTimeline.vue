<script setup lang="ts">
import type { Locale, Milestone, SectionId } from '~/types/milestone';
import { installationLayout } from '~/data/installation-layout';
import { getMilestoneCopy, interfaceCopy } from '~/data/localization';
import { layoutStyle } from '~/utils/layout-style';

const props = defineProps<{
  section: SectionId;
  locale: Locale;
  milestones: readonly Milestone[];
  currentId: string;
  pendingId: string | null;
}>();

const emit = defineEmits<{ select: [id: string] }>();

function buttonStyle(id: string) {
  const section = installationLayout.sections[props.section];
  return layoutStyle(section.timeline.find(item => item.milestoneId === id)!, section.section);
}
</script>

<template>
  <nav class="milestone-timeline" :aria-label="interfaceCopy[locale].timeline">
    <div class="timeline-track" aria-hidden="true" />
    <button
      v-for="item in milestones"
      :key="item.id"
      type="button"
      class="timeline-year"
      :class="{ 'is-current': item.id === currentId, 'is-pending': item.id === pendingId }"
      :style="buttonStyle(item.id)"
      :title="getMilestoneCopy(item, locale).title"
      :aria-label="`${item.year} — ${getMilestoneCopy(item, locale).title}`"
      :aria-current="item.id === currentId ? 'true' : undefined"
      :aria-busy="item.id === pendingId"
      @click="emit('select', item.id)"
    >
      <span>{{ item.year }}</span>
    </button>
  </nav>
</template>

<style scoped>
.milestone-timeline { position: absolute; inset: 0; z-index: 2; pointer-events: none; }
.timeline-track { position: absolute; left: 9%; top: 68.7%; width: 88%; height: 5.9%; border: 0.1cqw solid var(--accent); border-radius: 100px; background: var(--wash); box-shadow: inset 0 0 0 0.22cqw white; }
.timeline-year { position: absolute; pointer-events: auto; padding: 0.38vh 0.25cqw; border: 0; background: none; color: var(--accent-dark); font-weight: 800; font-size: 1.03cqw; cursor: pointer; }
.timeline-year span {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  border-radius: 100px;
  transition: background 0.7s cubic-bezier(0.22, 1, 0.36, 1),
              color 0.7s cubic-bezier(0.22, 1, 0.36, 1),
              box-shadow 0.7s cubic-bezier(0.22, 1, 0.36, 1),
              transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform, background, color, box-shadow;
}
.timeline-year:hover span { background: var(--tint); }
.timeline-year.is-current span {
  color: white;
  background: linear-gradient(var(--accent-light), var(--accent));
  box-shadow: inset 0 2px 1px #ffffff95, 0 0.22vh 0.12vh var(--line);
  font-size: 1.16cqw;
  transform: scale(1.05);
}
.timeline-year.is-pending span { outline: 2px dashed var(--accent); outline-offset: -2px; }
.timeline-year:focus-visible { outline: 2px solid var(--accent-dark); border-radius: 100px; outline-offset: 1px; }
</style>
