<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

/**
 * Dashboard password screen (NUXT_DASHBOARD_PASSWORD on the server): one centred input, Enter to
 * unlock. The server answers with an httpOnly 3-day session cookie; `unlocked` fires on success.
 */
const props = defineProps<{
  /** Shown under the input, e.g. when the session check could not reach the server. */
  message?: string;
}>();
const emit = defineEmits<{ unlocked: [] }>();

const password = ref('');
const error = ref(props.message ?? '');
const unlocking = ref(false);
const input = ref<HTMLInputElement | null>(null);
watch(() => props.message, (message) => {
  error.value = message ?? '';
});
onMounted(() => input.value?.focus());

async function unlock() {
  if (unlocking.value || !password.value)
    return;
  unlocking.value = true;
  try {
    await $fetch('/api/dashboard/login', { method: 'POST', body: { password: password.value } });
    emit('unlocked');
  }
  catch (failure) {
    error.value = (failure as { statusCode?: number }).statusCode === 401 ? 'Password salah' : 'Server tidak terhubung';
  }
  finally {
    password.value = '';
    unlocking.value = false;
    input.value?.focus();
  }
}
</script>

<template>
  <div class="grid h-dvh place-items-center bg-wall-night px-6 font-dashboard text-wall-ink">
    <form class="w-full max-w-xs" @submit.prevent="unlock">
      <input
        ref="input" v-model="password" type="password" autocomplete="current-password" enterkeyhint="go"
        placeholder="Clue: password wifi Aptronim" aria-label="Password dashboard" :aria-invalid="!!error" :disabled="unlocking"
        class="w-full rounded-xl bg-white/[0.06] px-4 py-3.5 text-center text-lg text-white ring-1 transition placeholder:text-base placeholder:text-sky-100/40 focus:outline-none focus:ring-2 disabled:opacity-60"
        :class="error ? 'ring-rose-400/70 focus:ring-rose-400' : 'ring-white/15 focus:ring-wall-glow'"
        data-dashboard-password @input="error = ''"
      >
      <p class="mt-3 h-5 text-center text-sm text-rose-300" aria-live="polite">
        {{ error }}
      </p>
    </form>
  </div>
</template>
