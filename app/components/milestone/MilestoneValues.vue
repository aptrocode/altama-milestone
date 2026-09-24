<script setup lang="ts">
import type { Locale, SectionId } from '~/types/milestone';
import { computed } from 'vue';
import { getSectionCopy } from '~/data/localization';

const props = defineProps<{ section: SectionId; locale: Locale }>();
const copy = computed(() => getSectionCopy(props.section, props.locale));
</script>

<template>
  <aside class="milestone-values" :aria-label="copy.valuesTitle">
    <h3>{{ copy.valuesTitle }}</h3>
    <div class="values-grid">
      <div v-for="value in copy.values" :key="value.icon" class="value-item">
        <MilestoneIcon :name="value.icon" />
        <p>{{ value.text }}</p>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.milestone-values { position: absolute; top: 82%; left: 8%; width: 86%; height: 13.5%; }
h3 { display: flex; align-items: center; justify-content: center; height: 23%; margin: 0; border-radius: 100px; background: var(--tint); color: var(--accent-dark); font-size: 1.02cqw; font-weight: 800; }
.values-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); height: 77%; padding-top: 1.2vh; }
.value-item { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.35vh; }
.value-item + .value-item { border-left: 1px solid var(--line); }
.value-item svg { height: 3.6vh; width: 3.2cqw; flex: none; }
.value-item p { margin: 0; white-space: pre-line; font-size: 0.82cqw; line-height: 1.18; font-weight: 650; }
</style>
