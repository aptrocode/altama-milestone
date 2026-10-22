<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useSettingsBackup } from '~/composables/useSettingsBackup';
import { useSettingsSync } from '~/composables/useSettingsSync';
import { useSettingsStore } from '~/stores/settings';
import { DEFAULT_FONT_SETTINGS } from '../../shared/font-settings';
import { DEFAULT_WALL_SETTINGS } from '../../shared/wall-settings';

/**
 * Operator dashboard shell: a darker navy sidebar (Wall, Hold, Sensor pages under
 * `pages/dashboard/*`, settings backup, fullscreen, reset) next to the wall-blue content, in the same hue. The
 * sidebar is fixed from `lg` and an off-canvas drawer below it.
 */
const NAV = [
  { section: 'Pengaturan', items: [
    { to: '/dashboard/wall', label: 'Wall', hint: 'Tampilan, reset & auto slide', icon: 'wall' },
    { to: '/dashboard/hold', label: 'Hold', hint: 'Tap, hold, atau delay', icon: 'hold' },
    { to: '/dashboard/font', label: 'Font', hint: 'Ukuran teks per section', icon: 'font' },
  ] },
  { section: 'Perangkat', items: [
    { to: '/dashboard/sensor', label: 'Sensor', hint: 'Sumber & kalibrasi', icon: 'sensor' },
  ] },
] as const;

const route = useRoute();
const pageTitle = computed(() => String(route.meta.title || 'Dashboard'));
const pageDescription = computed(() => String(route.meta.description || ''));
useHead({ title: () => `${pageTitle.value} · Dashboard · Altama Interactive Wall` });

// Settings sync (settings-sync plugin): pulled again right after login.
const sync = useSettingsSync();

// Password gate (NUXT_DASHBOARD_PASSWORD on the server, see DashboardLogin): the shell and its
// pages mount only once the session check or the login succeeds; without a password it is open.
const access = ref<'checking' | 'locked' | 'open'>('checking');
const lockMessage = ref('');
// Keluar shows only when the server has a password.
const passwordRequired = ref(false);
function lock(message = '') {
  lockMessage.value = message;
  access.value = 'locked';
}
onMounted(async () => {
  try {
    const session = await $fetch<{ unlocked: boolean; required?: boolean }>('/api/dashboard/session');
    passwordRequired.value = !!session.required;
    if (session.unlocked)
      access.value = 'open';
    else
      lock();
  }
  catch {
    lock('Server tidak terhubung');
  }
});
function onUnlocked() {
  access.value = 'open';
  passwordRequired.value = true;
  // Signed in: saves can reach the server now (and an empty server gets this browser's settings).
  sync.refresh();
}
async function logout() {
  try {
    await $fetch('/api/dashboard/logout', { method: 'POST' });
  }
  finally {
    lock();
  }
}

const drawerOpen = ref(false);
// Reset asks for confirmation in a dialog (see askReset) so a stray tap cannot wipe settings.
const resetDialog = ref(false);
watch(() => route.path, () => {
  drawerOpen.value = false;
});

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape')
    return;
  if (resetDialog.value)
    resetDialog.value = false;
  else
    drawerOpen.value = false;
}
onMounted(() => window.addEventListener('keydown', onKeydown));

const settings = useSettingsStore();
const backup = useSettingsBackup();
const fileInput = ref<HTMLInputElement | null>(null);
const notice = ref('');
let noticeTimer: ReturnType<typeof setTimeout> | undefined;
function showNotice(text: string) {
  notice.value = text;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => (notice.value = ''), 3000);
}

function exportSettings() {
  backup.exportSettings();
  showNotice('Pengaturan diekspor');
}

async function importSettings(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (file)
    showNotice(await backup.importSettings(file) ? 'Pengaturan diimpor dan diterapkan' : 'File tidak valid');
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement)
      await document.exitFullscreen();
    else
      await document.documentElement.requestFullscreen();
  }
  catch {
    showNotice('Fullscreen tidak tersedia');
  }
}

const cancelButton = ref<HTMLButtonElement | null>(null);
function askReset() {
  resetDialog.value = true;
  nextTick(() => cancelButton.value?.focus());
}
function confirmReset() {
  resetDialog.value = false;
  settings.resetHold();
  settings.setWall(DEFAULT_WALL_SETTINGS);
  settings.setFonts(DEFAULT_FONT_SETTINGS);
  showNotice('Wall, Hold & Font kembali ke default');
}

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
  clearTimeout(noticeTimer);
});

const footButton = 'group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-sky-100/80 transition-colors hover:bg-white/[0.06] hover:text-white';
const footIcon = 'grid size-8 shrink-0 place-items-center rounded-md bg-white/[0.05] text-sky-100/55 ring-1 ring-white/[0.06] transition-colors group-hover:text-white';
</script>

<template>
  <DashboardLogin v-if="access === 'locked'" :message="lockMessage" @unlocked="onUnlocked" />
  <div v-else-if="access === 'checking'" class="h-dvh bg-wall-night" />
  <div v-else class="h-dvh overflow-hidden bg-wall-night font-sans text-wall-ink select-text">
    <!-- Drawer backdrop (below lg). -->
    <div
      v-if="drawerOpen" class="fixed inset-0 z-30 bg-black/60 backdrop-blur-[2px] lg:hidden" aria-hidden="true"
      @click="drawerOpen = false"
    />

    <aside
      id="dashboard-sidebar"
      class="fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85vw] flex-col bg-[#020624] shadow-[1px_0_0_rgba(102,204,255,0.12)] transition-transform duration-200 ease-out motion-reduce:transition-none lg:w-64 lg:translate-x-0"
      :class="drawerOpen ? 'translate-x-0' : '-translate-x-full'"
      aria-label="Navigasi dashboard"
    >
      <div class="flex items-center gap-3 px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-6">
        <span class="grid size-10 place-items-center rounded-xl bg-linear-to-br from-wall-glow to-[#3b5bff] text-[#06124f] shadow-[0_0_18px_rgba(102,204,255,0.35)]" aria-hidden="true">
          <svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></svg>
        </span>
        <div class="min-w-0">
          <p class="font-display text-lg font-bold uppercase leading-tight tracking-wider text-white">
            Dashboard
          </p>
          <p class="truncate text-xs text-sky-100/55">
            Altama Interactive Wall
          </p>
        </div>
        <button
          type="button" class="ml-auto grid size-9 place-items-center rounded-lg text-sky-100/55 hover:bg-white/[0.06] hover:text-white lg:hidden"
          aria-label="Tutup menu" @click="drawerOpen = false"
        >
          <svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>

      <nav class="flex-1 space-y-6 overflow-y-auto px-3">
        <div v-for="group in NAV" :key="group.section">
          <p class="px-3 pb-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-sky-100/40">
            {{ group.section }}
          </p>
          <div class="space-y-1">
            <NuxtLink
              v-for="item in group.items" :key="item.to" :to="item.to"
              class="group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sky-100/80 transition-colors hover:bg-white/[0.06] hover:text-white"
              active-class="dashboard-nav-active !bg-wall-glow/[0.12] !text-white"
            >
              <span class="nav-icon grid size-9 shrink-0 place-items-center rounded-md bg-white/[0.05] text-sky-100/55 ring-1 ring-white/[0.06] transition-colors group-hover:text-white">
                <svg viewBox="0 0 24 24" class="size-[1.15rem]" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <template v-if="item.icon === 'hold'">
                    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
                  </template>
                  <template v-else-if="item.icon === 'font'">
                    <path d="M4 20 10 4h1l6 16M6.5 14h8" /><path d="M17 20h4" />
                  </template>
                  <template v-else-if="item.icon === 'wall'">
                    <rect x="3" y="4" width="5" height="16" rx="1" /><rect x="10" y="4" width="5" height="16" rx="1" /><rect x="17" y="4" width="4" height="16" rx="1" />
                  </template>
                  <template v-else>
                    <path d="M4.9 19.1a10 10 0 0 1 0-14.2M19.1 4.9a10 10 0 0 1 0 14.2M7.8 16.2a6 6 0 0 1 0-8.4M16.2 7.8a6 6 0 0 1 0 8.4" /><circle cx="12" cy="12" r="2" />
                  </template>
                </svg>
              </span>
              <span class="min-w-0">
                <span class="block text-sm font-bold leading-tight">{{ item.label }}</span>
                <span class="block truncate text-xs text-sky-100/40 group-hover:text-sky-100/55">{{ item.hint }}</span>
              </span>
            </NuxtLink>
          </div>
        </div>
      </nav>

      <div class="space-y-0.5 border-t border-white/[0.06] px-3 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <button type="button" :class="footButton" @click="exportSettings">
          <span :class="footIcon">
            <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></svg>
          </span>
          Export pengaturan
        </button>
        <button type="button" :class="footButton" @click="fileInput?.click()">
          <span :class="footIcon">
            <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21V9M7 14l5-5 5 5M5 3h14" /></svg>
          </span>
          Import pengaturan
        </button>
        <input ref="fileInput" type="file" accept="application/json,.json" class="hidden" @change="importSettings">
        <button type="button" :class="footButton" @click="toggleFullscreen">
          <span :class="footIcon">
            <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>
          </span>
          Fullscreen
        </button>
        <button
          type="button" class="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-rose-300/90 transition-colors hover:bg-rose-500/10 hover:text-rose-200"
          aria-haspopup="dialog" data-dashboard-reset @click="askReset"
        >
          <span class="grid size-8 shrink-0 place-items-center rounded-md bg-rose-500/10 text-rose-300 ring-1 ring-rose-400/20">
            <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
          </span>
          Reset ke default
        </button>
        <button v-if="passwordRequired" type="button" :class="footButton" data-dashboard-logout @click="logout">
          <span :class="footIcon">
            <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="M10 17l-5-5 5-5M5 12h11" /></svg>
          </span>
          Keluar
        </button>
      </div>
    </aside>

    <!-- The document never scrolls (kiosk rules in main.css), so the content column is the scroll area. -->
    <div class="flex h-dvh flex-col overflow-y-auto overscroll-contain touch-pan-y lg:pl-64">
      <!-- Top bar only below lg, where the sidebar is a drawer. -->
      <header class="sticky top-0 z-20 flex items-center gap-3 border-b border-white/10 bg-wall-night/90 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 backdrop-blur sm:px-6 lg:hidden">
        <button
          type="button" class="grid size-10 place-items-center rounded-lg ring-1 ring-white/15 hover:bg-white/10"
          aria-controls="dashboard-sidebar" :aria-expanded="drawerOpen" aria-label="Buka menu" @click="drawerOpen = true"
        >
          <svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <p class="font-display text-lg font-bold uppercase tracking-wider text-white">
          {{ pageTitle }}
        </p>
      </header>

      <p
        v-if="notice" class="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-bold text-[#04213a] shadow-lg"
        role="status" aria-live="polite"
      >
        {{ notice }}
      </p>

      <main class="w-full flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        <h1 class="font-display text-3xl font-bold uppercase tracking-wider text-white sm:text-4xl">
          {{ pageTitle }}
        </h1>
        <p v-if="pageDescription" class="mt-1 text-sm text-sky-100/60 sm:text-base">
          {{ pageDescription }}
        </p>
        <div class="mt-6">
          <NuxtPage />
        </div>
      </main>
    </div>

    <!-- Reset confirmation: centred card on wide screens, full-width sheet with large buttons on phones. -->
    <div
      v-if="resetDialog" class="fixed inset-0 z-[60] flex items-end justify-center bg-black/65 p-4 backdrop-blur-[2px] sm:items-center"
      @click.self="resetDialog = false"
    >
      <div
        role="alertdialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-text"
        class="w-full max-w-md rounded-2xl bg-[#071048] p-5 shadow-2xl ring-1 ring-wall-glow/25 sm:p-6"
      >
        <div class="flex items-start gap-4">
          <span class="grid size-11 shrink-0 place-items-center rounded-full bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30" aria-hidden="true">
            <svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
          </span>
          <div class="min-w-0">
            <h2 id="reset-title" class="font-display text-xl font-bold uppercase tracking-wide text-white">
              Reset ke default?
            </h2>
            <p id="reset-text" class="mt-1.5 text-sm leading-relaxed text-sky-100/70">
              Semua pengaturan <b class="text-white">Wall</b>, <b class="text-white">Hold</b>, dan <b class="text-white">Font</b> kembali ke nilai awal dan langsung berlaku di wall (di semua device kalau tersinkron ke server). Pengaturan Sensor tidak berubah.
            </p>
          </div>
        </div>
        <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            ref="cancelButton" type="button" class="rounded-lg px-4 py-2.5 font-bold ring-1 ring-white/20 hover:bg-white/10"
            @click="resetDialog = false"
          >
            Batal
          </button>
          <button
            type="button" class="rounded-lg bg-rose-500 px-4 py-2.5 font-bold text-white hover:bg-rose-400"
            data-dashboard-reset-confirm @click="confirmReset"
          >
            Ya, reset
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Active page: a glow accent bar on the left edge and a lit icon tile. */
.dashboard-nav-active::before {
  content: '';
  position: absolute;
  left: -0.75rem;
  top: 0.5rem;
  bottom: 0.5rem;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: var(--color-wall-glow);
  box-shadow: 0 0 10px rgba(102, 204, 255, 0.7);
}

.dashboard-nav-active .nav-icon {
  background: rgba(102, 204, 255, 0.18);
  color: var(--color-wall-glow);
}
</style>
