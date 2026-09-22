<script setup lang="ts">
import type { Milestone } from '~/types/milestone';
import { sectionPresentation } from '~/data/sections';

defineProps<{ milestone: Milestone }>();
</script>

<template>
  <article class="story-bubble">
    <svg class="bubble-outline" viewBox="0 0 500 350" preserveAspectRatio="none" aria-hidden="true">
      <path class="bubble-shadow" d="M45 36Q220-8 421 27Q483 41 484 130L488 226Q488 318 412 324L256 326 245 346 235 326 92 327Q17 328 14 248L12 123Q8 65 45 36Z" />
      <path class="bubble-line" d="M40 28Q235-13 421 21Q478 35 478 121L482 218Q482 308 407 313L254 316 244 335 234 316 87 317Q11 317 10 242L7 118Q6 58 40 28Z" />
    </svg>
    <div class="story-heading">
      <span class="story-badge">
        <MilestoneIcon :name="sectionPresentation[milestone.section].icon" />
      </span>
      <h2>{{ sectionPresentation[milestone.section].title }}</h2>
      <p class="story-subtitle">
        {{ sectionPresentation[milestone.section].subtitle }}
      </p>
    </div>
    <div class="story-copy">
      <Transition name="story-morph" mode="out-in">
        <div :key="milestone.id" class="story-body">
          <p v-for="(paragraph, index) in milestone.description.split('\n\n')" :key="index">
            {{ paragraph }}
          </p>
        </div>
      </Transition>
    </div>
    <span class="story-spark spark-one" aria-hidden="true">✧</span>
    <span class="story-spark spark-two" aria-hidden="true">✧</span>
  </article>
</template>

<style scoped>
.story-bubble { position: absolute; top: 2.8%; left: 10%; width: 87%; height: 35%; }
.bubble-outline { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.bubble-shadow { fill: var(--tint); stroke: none; }
.bubble-line { fill: #fff; stroke: var(--accent); stroke-width: 3.5; }
.story-heading { position: relative; min-height: 29%; padding: 6.5% 9% 0 31%; }
h2 { margin: 0; white-space: pre-line; color: var(--accent-dark); font-size: 1.45cqw; font-weight: 800; line-height: 1.06; letter-spacing: -0.035em; }
.story-subtitle { margin: 0.45vh 0 0; font-size: 0.84cqw; font-weight: 700; line-height: 1.16; }
.story-badge { position: absolute; top: -1.4vh; left: 6%; width: 7cqw; height: 11.5vh; display: grid; place-items: center; border: 0.22cqw solid var(--accent); border-radius: 50%; background: radial-gradient(circle at 35% 28%, #fff 25%, var(--tint)); transform: rotate(-8deg); box-shadow: -0.3cqw 0.1cqw 0 0 var(--tint); }
.story-badge::before { content: ''; position: absolute; inset: -0.55cqw 0.02cqw 0.3cqw -0.2cqw; border: 0.14cqw solid var(--accent); border-radius: 48%; }
.story-badge svg { width: 67%; height: 74%; transform: rotate(8deg); }
.story-copy { position: relative; padding: 0.8vh 8% 0 10%; font-size: 1cqw; font-weight: 400; line-height: 1.22; }
.story-copy p { margin: 0 0 0.75vh; }
.story-body { will-change: opacity, transform, filter; }
.story-morph-enter-active,
.story-morph-leave-active {
  transition: opacity 1.2s cubic-bezier(0.22, 1, 0.36, 1),
              transform 1.2s cubic-bezier(0.22, 1, 0.36, 1),
              filter 1.2s ease;
  will-change: opacity, transform, filter;
}
.story-morph-enter-from {
  opacity: 0;
  transform: translateY(10px);
  filter: blur(3px);
}
.story-morph-leave-to {
  opacity: 0;
  transform: translateY(-8px);
  filter: blur(3px);
}
.story-spark { position: absolute; font-size: 2cqw; font-weight: 800; color: var(--accent); }
.spark-one { top: 48%; left: -4%; }
.spark-two { right: -2%; bottom: 18%; }
</style>
