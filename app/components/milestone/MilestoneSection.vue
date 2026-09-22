<script setup lang="ts">
import type { AssetCache } from '~/composables/useAssetCache';
import type { MilestoneArtworkHandle } from '~/types/components';
import type { SectionId } from '~/types/milestone';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useMilestoneAnimation } from '~/composables/useMilestoneAnimation';
import { useMilestoneMachine } from '~/composables/useMilestoneMachine';
import { installationLayout } from '~/data/installation-layout';
import { getAdjacentMilestone, getMilestoneForSection, initialMilestoneId, milestonesBySection } from '~/data/milestones';
import { sectionPresentation } from '~/data/sections';
import { useMilestoneStore } from '~/stores/milestone';
import { layoutStyle } from '~/utils/layout-style';

const props = defineProps<{
  section: SectionId;
  assetCache: AssetCache;
}>();

const root = ref<HTMLElement | null>(null);
const artwork = ref<MilestoneArtworkHandle | null>(null);
const store = useMilestoneStore();
const state = computed(() => store.sections[props.section]);
const current = computed(() => getMilestoneForSection(props.section, state.value.currentId)!);
const animation = useMilestoneAnimation(root);
const presentation = computed(() => sectionPresentation[props.section]);
const layout = computed(() => installationLayout.sections[props.section]);

const machine = useMilestoneMachine({
  section: props.section,
  initialId: initialMilestoneId[props.section],
  getState: () => store.sections[props.section],
  patch: patch => store.patchSection(props.section, patch),
  getMilestone: id => getMilestoneForSection(props.section, id),
  getAdjacent: id => getAdjacentMilestone(props.section, id),
  cache: props.assetCache,
  renderer: {
    ...animation,
    stage: milestone => artwork.value?.stage(milestone) ?? Promise.reject(new Error('Artwork component is not mounted')),
    commit: () => artwork.value?.commit() ?? Promise.reject(new Error('Artwork component is not mounted')),
  },
});

function reveal() {
  return machine.reveal();
}

function selectMilestone(id: string) {
  machine.selectMilestone(id);
}

function reset() {
  machine.reset();
}

onMounted(async () => {
  await machine.start();
});
onUnmounted(() => machine.dispose());

defineExpose({ reveal, selectMilestone, reset });
</script>

<template>
  <section ref="root" class="milestone-section" :data-section="section" :data-phase="state.phase">
    <MilestoneInfo :milestone="current" />

    <div class="scene-area" :style="layoutStyle(layout.artwork, layout.section)">
      <MilestoneArtwork ref="artwork" :milestone="current" :ready="state.assetStatus === 'ready'" @activate="reveal" />
    </div>

    <div class="milestone-year" aria-live="polite">
      <div class="year-number">
        <span class="year-rays" aria-hidden="true">≋</span>
        <strong>{{ current.year }}</strong>
        <span class="year-rays" aria-hidden="true">≋</span>
      </div>
      <p>{{ presentation.caption }}</p>
    </div>

    <MilestoneTimeline
      :section="section"
      :milestones="milestonesBySection[section]"
      :current-id="state.currentId"
      :pending-id="state.pendingId"
      @select="selectMilestone"
    />
    <MilestoneValues :section="section" />
    <p v-if="state.error" class="asset-error" role="status">
      {{ state.error }}
    </p>
  </section>
</template>

<style scoped>
.milestone-section { position: relative; height: 100%; min-width: 0; }
.scene-area { position: absolute; isolation: isolate; z-index: 0; }
.milestone-year { position: absolute; z-index: 1; left: 9%; width: 88%; top: 59%; height: 9%; text-align: center; pointer-events: none; }
.year-number { display: flex; height: 76%; align-items: center; justify-content: center; gap: 1.2cqw; }
.year-number strong { display: block; color: var(--accent); font-size: 4.5cqw; font-weight: 950; font-style: italic; line-height: 1; letter-spacing: -0.045em; -webkit-text-stroke: 0.06cqw var(--accent-dark); text-shadow: 0 0.26vh 0 var(--accent-dark), 0.08cqw -0.1vh white; }
.year-rays { color: var(--accent); font-size: 2.3cqw; transform: rotate(-90deg); font-weight: 900; }
.year-rays:last-child { transform: rotate(90deg); }
.milestone-year p { margin: 0.2vh 0 0; font-size: 1.02cqw; font-weight: 850; text-transform: uppercase; line-height: 1.15; }
.asset-error { position: absolute; top: 66%; width: 100%; color: #c3222b; text-align: center; font-size: 0.6cqw; }
</style>
