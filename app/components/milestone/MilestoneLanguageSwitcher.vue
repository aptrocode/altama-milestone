<script setup lang="ts">
import type { Locale, SectionId } from '~/types/milestone';
import { installationLayout } from '~/data/installation-layout';
import { interfaceCopy } from '~/data/localization';
import { LOCALES } from '~/types/milestone';
import { layoutStyle } from '~/utils/layout-style';

const props = defineProps<{
  section: SectionId;
  locale: Locale;
}>();

const emit = defineEmits<{ select: [locale: Locale] }>();

const flags: Record<Locale, { src: string; name: string }> = {
  'id': { src: '/flags/indonesia.svg', name: 'Bahasa Indonesia' },
  'en': { src: '/flags/english.svg', name: 'English' },
  'zh-Hans': { src: '/flags/china.svg', name: '简体中文' },
};

function buttonStyle(locale: Locale) {
  const layout = installationLayout.sections[props.section];
  return layoutStyle(layout.languages.find(item => item.locale === locale)!, layout.section);
}
</script>

<template>
  <nav class="language-switcher" :aria-label="interfaceCopy[locale].languages">
    <button
      v-for="option in LOCALES"
      :key="option"
      type="button"
      class="language-button"
      :class="{ 'is-selected': option === locale }"
      :style="buttonStyle(option)"
      :data-locale="option"
      :aria-label="flags[option].name"
      :aria-pressed="option === locale"
      @click="emit('select', option)"
    >
      <img :src="flags[option].src" alt="" draggable="false">
    </button>
  </nav>
</template>

<style scoped>
.language-switcher { position: absolute; inset: 0; z-index: 3; pointer-events: none; }
.language-button {
  position: absolute;
  display: grid;
  place-items: center;
  padding: 0.58vh 0.34cqw;
  border: 0.13cqw solid var(--line);
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0.24vh 0.55vh #12347724;
  cursor: pointer;
  pointer-events: auto;
  transition: border-color 180ms ease, box-shadow 180ms ease, filter 180ms ease;
}
.language-button img { display: block; width: 100%; height: auto; max-height: 100%; border-radius: 0.12cqw; box-shadow: 0 0 0 1px #12347733; }
.language-button.is-selected { border-color: var(--accent); box-shadow: 0 0 0 0.15cqw var(--accent), 0 0.35vh 0.85vh #12347730; }
.language-button:hover { filter: saturate(1.25) brightness(1.04); }
.language-button:focus-visible { outline: 0.18cqw solid #123477; outline-offset: 0.34cqw; }
@media (prefers-reduced-motion: reduce) {
  .language-button { transition: none; }
}
</style>
