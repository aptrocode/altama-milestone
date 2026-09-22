<script setup lang="ts">
import type { SectionId } from '~/types/milestone';
import { sectionPresentation } from '~/data/sections';

defineProps<{ section: SectionId }>();
</script>

<template>
  <aside class="milestone-values" :aria-label="sectionPresentation[section].valuesTitle">
    <h3>{{ sectionPresentation[section].valuesTitle }}</h3>
    <div class="values-grid">
      <div v-for="value in sectionPresentation[section].values" :key="value.icon" class="value-item">
        <MilestoneIcon :name="value.icon" />
        <p>{{ value.text }}</p>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.milestone-values { position: absolute; top: 76%; left: 8%; width: 86%; height: 17%; }
h3 { display: flex; align-items: center; justify-content: center; height: 23%; margin: 0; border-radius: 100px; background: var(--tint); color: var(--accent-dark); font-size: 1.02cqw; font-weight: 800; }
.values-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); height: 77%; padding-top: 2.2vh; }
.value-item { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.6vh; }
.value-item + .value-item { border-left: 1px solid var(--line); }
.value-item svg { height: 5.4vh; width: 4.2cqw; flex: none; }
.value-item p { margin: 0; white-space: pre-line; font-size: 0.9cqw; line-height: 1.22; font-weight: 650; }
</style>
