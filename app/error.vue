<script setup lang="ts">
import type { NuxtError } from '#app';

defineProps<{ error: NuxtError }>();

function recover() {
  clearError({ redirect: '/' });
}
</script>

<template>
  <main class="relative grid h-dvh w-dvw place-items-center overflow-hidden bg-white px-[7vw] text-[#123477]">
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div class="absolute top-[-45vh] left-[-10vw] h-[75vh] w-[65vw] rounded-full bg-[#fff0ce]" />
      <div class="absolute right-[-14vw] bottom-[-55vh] h-[80vh] w-[100vw] rounded-full bg-[#d8f3ff]" />
    </div>
    <section class="relative grid w-full grid-cols-[auto_1fr] items-center gap-[5vw] border-y border-[#b9e4f3] py-[8vh]">
      <p class="text-[16vw] leading-none font-black tracking-[-0.07em] text-[#008feb]">
        {{ error.status }}
      </p>
      <div>
        <p class="text-[1vw] font-bold tracking-[0.16em] text-[#e68100] uppercase">
          Perjalanan Altama
        </p>
        <h1 class="mt-[2vh] text-[3.2vw] leading-tight font-bold">
          {{ error.status === 404 ? 'Halaman tidak ditemukan' : 'Tampilan perlu dimuat ulang' }}
        </h1>
        <p class="mt-[2vh] text-[1.25vw] leading-relaxed">
          Kembali ke perjalanan milestone untuk melanjutkan.
        </p>
        <button
          type="button"
          class="mt-[4vh] rounded-full border-2 border-[#ec9808] bg-[#ffb317] px-[2.5vw] py-[1.6vh] text-[1.1vw] font-bold text-[#123477] transition-colors hover:bg-[#ffc644] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0057cb]"
          @click="recover"
        >
          Kembali ke milestone
        </button>
      </div>
    </section>
  </main>
</template>
