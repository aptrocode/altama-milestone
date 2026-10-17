<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import { STAGE_MEDIA } from '~/data/wall-media';

const background = STAGE_MEDIA.background;
const skyline = STAGE_MEDIA.skyline;

// Light sweeps traced over the neon waves in the top corners of the current background image
// (logical 2304 x 1344 coordinates). Each streak travels along its curve, staggered.
const WAVE_SWEEPS = [
  { d: 'M0 342 Q 105 165 218 0', color: '#c8f6ff', width: 4, duration: 6.5, delay: 0 },
  { d: 'M60 365 Q 330 120 665 0', color: '#eef7ff', width: 3, duration: 8, delay: 1.6 },
  { d: 'M120 365 Q 420 120 790 8', color: '#ecc8ff', width: 3, duration: 9, delay: 3.8 },
  { d: 'M405 365 Q 610 305 712 48', color: '#f4e8ff', width: 3, duration: 7.5, delay: 5.2 },
  { d: 'M1915 0 C 1912 160 1990 250 2232 362', color: '#eefaff', width: 4, duration: 7, delay: 0.8 },
  { d: 'M1890 10 C 1790 120 1770 290 1865 362', color: '#b4ecff', width: 3, duration: 8.5, delay: 3 },
  { d: 'M2232 366 L 2310 292', color: '#e8d0ff', width: 3, duration: 4.5, delay: 2.2 },
] as const;
const video = ref<HTMLVideoElement | null>(null);
// A missing or undecodable file falls back to the coded gradient instead of a black wall.
const failed = ref(false);

onBeforeUnmount(() => {
  const element = video.value;
  if (!element)
    return;
  element.pause();
  element.removeAttribute('src');
  element.load();
});
</script>

<template>
  <div class="pointer-events-none absolute inset-0 overflow-hidden bg-wall-night" aria-hidden="true">
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_8%,#2347d8_0%,#11248f_32%,#081460_62%,#040a3a_100%)]" />
    <svg class="absolute inset-0 size-full" viewBox="0 0 2304 1344" preserveAspectRatio="none">
      <defs>
        <filter id="wall-wave-glow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <linearGradient id="wall-wave-left" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stop-color="#7c5cff" stop-opacity="0" />
          <stop offset="0.45" stop-color="#5ab8ff" stop-opacity="0.9" />
          <stop offset="1" stop-color="#9be3ff" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="wall-wave-right" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#8fdcff" stop-opacity="0.9" />
          <stop offset="1" stop-color="#6d4dff" stop-opacity="0" />
        </linearGradient>
      </defs>
      <g fill="none" stroke-linecap="round">
        <g filter="url(#wall-wave-glow)" opacity="0.7">
          <path d="M-40 470 C 260 210 620 70 1120 -20" stroke="url(#wall-wave-left)" stroke-width="18" />
          <path d="M2350 40 C 2050 120 1860 330 1900 560" stroke="url(#wall-wave-right)" stroke-width="16" />
        </g>
        <path d="M-40 470 C 260 210 620 70 1120 -20" stroke="url(#wall-wave-left)" stroke-width="3" />
        <path d="M-40 560 C 300 300 700 140 1300 40" stroke="url(#wall-wave-left)" stroke-width="1.5" opacity="0.6" />
        <path d="M2350 40 C 2050 120 1860 330 1900 560" stroke="url(#wall-wave-right)" stroke-width="3" />
        <path d="M2350 -20 C 1980 60 1760 300 1800 620" stroke="url(#wall-wave-right)" stroke-width="1.5" opacity="0.55" />
        <path d="M-40 1060 C 380 980 760 900 1100 760" stroke="url(#wall-wave-left)" stroke-width="2" opacity="0.5" />
        <path d="M2350 880 C 2000 940 1700 1000 1350 1120" stroke="url(#wall-wave-right)" stroke-width="2" opacity="0.45" />
      </g>
    </svg>

    <img
      v-if="background.kind === 'image' && !failed" :src="background.src" alt=""
      class="absolute inset-0 size-full object-cover" @error="failed = true"
    >
    <video
      v-else-if="background.kind === 'video' && !failed" ref="video" :src="background.src" :poster="background.poster"
      class="absolute inset-0 size-full object-cover" autoplay muted loop playsinline preload="auto" disablepictureinpicture
      @error="failed = true"
    />

    <svg
      v-if="STAGE_MEDIA.waveSweeps && background.kind === 'image' && !failed"
      class="wall-waves absolute inset-0 size-full mix-blend-screen" viewBox="0 0 2304 1344" preserveAspectRatio="none"
    >
      <defs>
        <filter id="wall-sweep-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <radialGradient id="wall-corner-glow">
          <stop offset="0" stop-color="#5fb6ff" stop-opacity="0.55" />
          <stop offset="1" stop-color="#5fb6ff" stop-opacity="0" />
        </radialGradient>
      </defs>
      <ellipse class="wall-corner-glow" cx="260" cy="150" rx="420" ry="260" fill="url(#wall-corner-glow)" />
      <ellipse class="wall-corner-glow wall-corner-glow-late" cx="2010" cy="170" rx="380" ry="260" fill="url(#wall-corner-glow)" />
      <g fill="none" stroke-linecap="round">
        <g filter="url(#wall-sweep-blur)">
          <path
            v-for="(sweep, index) in WAVE_SWEEPS" :key="`halo-${index}`" class="wall-sweep" :d="sweep.d" :stroke="sweep.color"
            :stroke-width="sweep.width * 4" pathLength="1" :style="{ animationDuration: `${sweep.duration}s`, animationDelay: `${sweep.delay}s` }"
          />
        </g>
        <path
          v-for="(sweep, index) in WAVE_SWEEPS" :key="`core-${index}`" class="wall-sweep" :d="sweep.d" stroke="#ffffff"
          :stroke-width="sweep.width" pathLength="1" :style="{ animationDuration: `${sweep.duration}s`, animationDelay: `${sweep.delay}s` }"
        />
      </g>
    </svg>

    <img
      v-if="skyline" :src="skyline.src" alt=""
      class="absolute inset-x-0 bottom-0 w-full h-[calc(308*var(--wall-y))] object-cover object-bottom"
    >
  </div>
</template>

<style scoped>
/* A short dash travels along each traced wave; reduced motion keeps the static image only. */
.wall-sweep {
  stroke-dasharray: 0.1 1;
  stroke-dashoffset: 0.1;
  opacity: 0;
}

.wall-corner-glow {
  opacity: 0.35;
}

@media (prefers-reduced-motion: no-preference) {
  .wall-sweep {
    animation-name: wall-sweep;
    animation-timing-function: cubic-bezier(0.45, 0, 0.55, 1);
    animation-iteration-count: infinite;
    animation-fill-mode: both;
  }

  .wall-corner-glow {
    animation: wall-corner-breathe 7s ease-in-out infinite;
  }

  .wall-corner-glow-late {
    animation-delay: -3.5s;
  }
}

@keyframes wall-sweep {
  0% { stroke-dashoffset: 0.1; opacity: 0; }
  15% { opacity: 0.9; }
  75% { opacity: 0.9; }
  100% { stroke-dashoffset: -1; opacity: 0; }
}

@keyframes wall-corner-breathe {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.6; }
}
</style>
