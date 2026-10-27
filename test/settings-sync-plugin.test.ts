import type { SettingsDocument, SyncedSettings } from '../shared/settings';
import { createPinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSettingsSync } from '../app/composables/useSettingsSync';
import { useSettingsStore } from '../app/stores/settings';
import { normalizeSyncedSettings } from '../shared/settings';

const disposers: (() => void)[] = [];
beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  disposers.splice(0).forEach(dispose => dispose());
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

async function setup(path = '/dashboard/wall', base = '') {
  const store = useSettingsStore(createPinia());
  const route = { path };
  const visibility = Object.assign(new EventTarget(), { visibilityState: 'visible' });
  let server: SettingsDocument = { version: 1, updatedAt: null, settings: normalizeSyncedSettings({}) };
  const fetch = vi.fn(async (_url: string, request?: { method?: string; body?: SyncedSettings }) => {
    if (request?.method === 'PUT')
      server = { version: server.version + 1, updatedAt: null, settings: request.body! };
    return server;
  });
  vi.stubGlobal('defineNuxtPlugin', (setup: unknown) => setup);
  vi.stubGlobal('useRuntimeConfig', () => ({ public: { settingsSyncUrl: base } }));
  vi.stubGlobal('useRouter', () => ({ currentRoute: { value: route } }));
  vi.stubGlobal('$fetch', fetch);
  vi.stubGlobal('window', { location: { href: 'http://local/', origin: 'http://local' } });
  vi.stubGlobal('document', visibility);
  const { default: plugin } = await import('../app/plugins/settings-sync.client');
  await plugin({ vueApp: { onUnmount: (fn: () => void) => disposers.push(fn) } } as unknown as Parameters<typeof plugin>[0]);
  await vi.advanceTimersByTimeAsync(0);
  return {
    store,
    route,
    fetch,
    visibility,
    server: () => server,
    setServer: (next: SettingsDocument) => {
      server = next;
    },
  };
}

describe('settings sync plugin boundary', () => {
  it('finishes a captured dashboard save after navigating to the wall within 300 ms', async () => {
    const test = await setup();
    test.store.setWall({ ...test.store.wall, resetSeconds: 45 });
    test.route.path = '/';
    await vi.advanceTimersByTimeAsync(300);
    expect(test.fetch.mock.calls.filter(([, request]) => request?.method === 'PUT')).toHaveLength(1);
    expect(test.server().settings?.wall.resetSeconds).toBe(45);
  });

  it.each([
    { path: '/', base: '' },
    { path: '/dashboard/wall', base: 'https://remote.example' },
  ])('does not authorize saves on $path with base "$base"', async ({ path, base }) => {
    const test = await setup(path, base);
    test.store.setWall({ ...test.store.wall, resetSeconds: 45 });
    await vi.advanceTimersByTimeAsync(5300);
    expect(test.fetch.mock.calls.filter(([, request]) => request?.method === 'PUT')).toHaveLength(0);
  });

  it('polls without echoing and cleans up polling, subscriptions, visibility and refresh on unmount', async () => {
    const test = await setup();
    test.setServer({ version: 2, updatedAt: null, settings: normalizeSyncedSettings({ wall: { resetSeconds: 45 } }) });
    await vi.advanceTimersByTimeAsync(5000);
    expect(test.store.wall.resetSeconds).toBe(45);
    expect(test.fetch.mock.calls.filter(([, request]) => request?.method === 'PUT')).toHaveLength(0);
    disposers.splice(0).forEach(dispose => dispose());
    const before = test.fetch.mock.calls.length;
    test.store.setWall({ ...test.store.wall, resetSeconds: 60 });
    test.visibility.dispatchEvent(new Event('visibilitychange'));
    await useSettingsSync().refresh();
    await vi.advanceTimersByTimeAsync(5300);
    expect(test.fetch).toHaveBeenCalledTimes(before);
    expect(vi.getTimerCount()).toBe(0);
  });
});
