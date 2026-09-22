<script setup lang="ts">
import type { MilestoneIconName } from '~/data/sections';

defineProps<{ name: MilestoneIconName }>();
</script>

<template>
  <svg viewBox="0 0 100 100" fill="none" stroke="#102d65" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <g v-if="name === 'bulb'">
      <path d="M36 63C34 54 23 49 25 35a25 25 0 0 1 50 0c2 14-9 19-11 28l-2 12H38Z" fill="#ffcf37" />
      <path d="M37 69h26v13H37Zm5 14h16l-4 7h-8Z" fill="#73c7ef" />
      <path d="M45 68 41 44l9 6 9-6-4 24" stroke="#f29312" />
      <path d="M50 3v-6M17 14l6 6M9 38h8M14 64l7-4M83 14l-6 6M91 38h-8M86 64l-7-4" stroke="#f4a215" />
      <path d="M35 37q0-14 13-17" stroke="#fff5b9" stroke-width="6" />
    </g>
    <g v-else-if="name === 'chart'">
      <path d="M13 84h75" />
      <path d="M19 62h15v22H19Z" fill="#91d941" />
      <path d="M43 43h15v41H43Z" fill="#4dc6f6" />
      <path d="M67 23h15v61H67Z" fill="#36a9ee" />
      <path d="m18 47 24-22 15 5L80 7M66 8l16-3-2 16" stroke="#0876dc" stroke-width="5" />
      <path d="M23 65v13M47 48v29M72 29v48" stroke="#fff" stroke-width="3" />
    </g>
    <g v-else-if="name === 'rocket'">
      <path d="m38 65-18 4 5-20 17-11M59 72l-4 17 20-10 1-23" fill="#ff514e" />
      <path d="M30 72q-12 10-13 23 16-3 25-17" fill="#ffcf35" />
      <path d="M35 65Q44 19 89 9q1 48-42 67Z" fill="#e5f7ff" />
      <path d="M65 18 86 37q5-13 3-28-13 3-24 9Z" fill="#ff4545" />
      <circle cx="61" cy="44" r="11" fill="#35baf3" />
      <path d="m37 72 8 8M24 75l9-4M52 43l7-6" stroke="#fff" />
    </g>
    <g v-else-if="name === 'heart'">
      <path d="M50 84 14 49C-4 27 22 3 42 21l8 9 8-9C80 3 105 27 86 49Z" fill="#ff4a58" />
      <path d="M17 35q4-16 19-9" stroke="#ffb0ab" stroke-width="6" />
      <path d="M4 61 0 64M95 60l5 4M8 11 3 7M93 11l5-4" stroke="#f6a617" />
    </g>
    <g v-else-if="name === 'gear'">
      <path d="m42 8 16 0 3 13 11 5 12-6 9 15-10 9v12l10 9-9 15-12-6-11 5-3 13H42l-3-13-11-5-12 6-9-15 10-9V44L7 35l9-15 12 6 11-5Z" fill="#ffa72e" />
      <circle cx="50" cy="50" r="17" fill="#fff7dc" />
    </g>
    <g v-else-if="name === 'sprout'">
      <path d="M50 88V43" stroke="#397a43" stroke-width="7" />
      <path d="M49 56Q11 54 9 15q36-1 41 36M51 43Q56 9 91 13 88 48 51 55" fill="#65c94c" />
      <path d="m24 28 25 27m26-28L51 50" stroke="#267c43" />
      <path d="M27 90q23-13 46 0" stroke="#6eb044" />
    </g>
    <g v-else-if="name === 'team'">
      <circle cx="50" cy="23" r="14" fill="#30bffa" />
      <circle cx="19" cy="40" r="11" fill="#82dbfd" />
      <circle cx="81" cy="40" r="11" fill="#82dbfd" />
      <path d="M4 83V69q0-20 24-14M96 83V69q0-20-24-14" fill="#238ded" />
      <path d="M27 85V66a23 23 0 0 1 46 0v19Z" fill="#24adf6" />
    </g>
    <g v-else-if="name === 'target'">
      <circle cx="44" cy="57" r="34" fill="#3bbdf4" />
      <circle cx="44" cy="57" r="23" fill="#fff" />
      <circle cx="44" cy="57" r="12" fill="#288bf0" />
      <path d="m44 57 39-40M69 27l1-17 10-7 0 16 15 1-8 10Z" fill="#1889ed" />
    </g>
    <g v-else-if="name === 'network'">
      <path d="m50 18-33 60h66Z" stroke="#ed3039" stroke-width="6" />
      <circle cx="50" cy="18" r="11" fill="#ff5054" />
      <circle cx="17" cy="78" r="11" fill="#ff5054" />
      <circle cx="83" cy="78" r="11" fill="#ff5054" />
      <path d="m47 14 3-2M14 74l3-2M80 74l3-2" stroke="white" />
    </g>
    <g v-else-if="name === 'handshake'">
      <path d="m14 22 24 5 10 4 16-4 22 26-27 29-39-30Z" fill="#ffd1af" />
      <path d="m36 28 16-6 25 10-18 17-14-8-14 11q-9 0-7-8Z" fill="#ffe2c6" />
      <path d="m5 20 16-8 13 15-14 31L4 47ZM66 27l12-14 18 8-3 27-15 9Z" fill="#ff5058" />
      <path d="m48 60 17 14M55 53l17 14M39 67l16 13" />
    </g>
  </svg>
</template>
