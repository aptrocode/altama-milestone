<script setup lang="ts">
import type { WallLocale } from '../../../shared/wall';
import type { PageCopy } from '~/data/wall-config';

defineProps<{ copy: PageCopy; locale: WallLocale }>();
</script>

<template>
  <div class="grid content-start gap-[calc(12*var(--wall-y))]">
    <template v-for="(block, index) in copy.blocks" :key="index">
      <p v-if="typeof block === 'string'">
        {{ block }}
      </p>
      <ul
        v-else-if="'bullets' in block" class="grid list-disc pl-[calc(20*var(--wall-x))] marker:text-white"
        :class="block.inline ? 'gap-0' : 'gap-[calc(10*var(--wall-y))]'"
      >
        <li v-for="item in block.bullets" :key="item.lead" class="pl-[calc(6*var(--wall-x))]">
          <template v-if="block.inline">
            {{ item.lead }}{{ item.text ? (locale === 'zh-Hans' ? '：' : ':') : '' }} {{ item.text }}
          </template>
          <template v-else>
            {{ item.lead }}{{ item.text ? (locale === 'zh-Hans' ? '：' : ':') : '' }}
            <span v-if="item.text" class="block -ml-[calc(26*var(--wall-x))]">{{ item.text }}</span>
          </template>
        </li>
      </ul>
      <ol v-else class="grid gap-[calc(10*var(--wall-y))] list-decimal pl-[calc(20*var(--wall-x))]">
        <li v-for="item in block.numbered" :key="item">
          {{ item }}
        </li>
      </ol>
    </template>
  </div>
</template>
