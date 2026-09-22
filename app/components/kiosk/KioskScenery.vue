<template>
  <svg class="kiosk-scenery" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <linearGradient id="hill-blue" x2="0" y2="1">
        <stop stop-color="#b0e7f8" />
        <stop offset="1" stop-color="#effbff" />
      </linearGradient>
      <linearGradient id="hill-green" x2="0" y2="1">
        <stop stop-color="#ccec69" />
        <stop offset="1" stop-color="#91ca35" />
      </linearGradient>
      <g id="leaf-branch" stroke="#194e51" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M0 160Q34 69 41 0" fill="none" />
        <path d="M32 57Q-2 43 4 12q36 1 28 45Z" fill="#58b858" />
        <path d="M37 32Q32 0 62-12q13 29-25 44Z" fill="#85c94a" />
        <path d="M21 92Q-16 82-17 50q37-1 38 42Z" fill="#139d6e" />
        <path d="M30 71Q41 32 69 39q-2 33-39 32Z" fill="#55b85d" />
        <path d="M6 132Q-30 123-33 89q35-4 39 43Z" fill="#73bf47" />
        <path d="M18 111Q35 76 62 90q-8 30-44 21Z" fill="#38ac65" />
      </g>
      <g id="flowers">
        <path d="M0 0Q-18-28-29-4-29 11-8 11-29 26-9 33 5 36 8 15 20 39 33 20 39 6 17 5 39-8 21-22 7-29 0 0Z" fill="#fffaf0" stroke="#184b52" stroke-width="3" />
        <circle cx="5" cy="6" r="8" fill="#ffbc24" />
      </g>
      <g id="shrub" fill="#52ae52" stroke="#174e50" stroke-width="3">
        <path d="M0 85Q-8 63 13 55 6 24 35 29 35 1 59 12 83-8 93 26 120 24 113 54 140 71 125 87Z" />
        <path d="M26 82q-9-20 12-29 8-21 26-8 24-12 30 11 23 5 17 26" fill="#86c341" />
      </g>
    </defs>
    <path d="M0 877Q100 801 208 855q110 56 226-12 85-37 153 10 85-48 153-11 76 47 143 7 72-42 163 2 93-62 191 5 119-78 217 13l146-30v61H0Z" fill="url(#hill-blue)" />
    <path d="M0 875q102-66 232-19 86-1 201 44H0Zm1600-22q-120-44-215 16-158-21-270 31h485Z" fill="url(#hill-green)" />
    <use href="#shrub" x="71" y="850" />
    <use href="#shrub" x="243" y="858" />
    <use href="#shrub" x="1160" y="856" />
    <use href="#shrub" x="1378" y="855" />
    <g transform="translate(-40 595) scale(.65 1)">
      <use href="#leaf-branch" />
      <use href="#leaf-branch" transform="translate(1 153) rotate(-5)" />
      <use href="#leaf-branch" transform="translate(57 199) rotate(24)" />
      <use href="#flowers" x="58" y="265" />
      <use href="#flowers" x="25" y="229" transform="scale(.65)" />
    </g>
    <g transform="translate(1640 595) scale(-.65 1)">
      <use href="#leaf-branch" />
      <use href="#leaf-branch" transform="translate(1 153) rotate(-5)" />
      <use href="#leaf-branch" transform="translate(57 199) rotate(24)" />
      <use href="#flowers" x="58" y="265" />
    </g>
    <use href="#flowers" x="1195" y="875" transform="translate(446 320) scale(.64)" />
  </svg>
</template>

<style scoped>
.kiosk-scenery { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: -1; }
</style>
