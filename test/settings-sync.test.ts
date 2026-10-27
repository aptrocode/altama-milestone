import type { SettingsDocument, SyncedSettings } from '../shared/settings';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSettingsSync } from '../app/utils/settings-sync';
import { normalizeSyncedSettings } from '../shared/settings';

function settings(seconds = 30) {
  return normalizeSyncedSettings({ wall: { resetSeconds: seconds } });
}
function document(version: number, seconds = 30): SettingsDocument {
  return { version, updatedAt: version ? '2026-10-26T00:00:00Z' : null, settings: version ? settings(seconds) : null };
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
const controllers: ReturnType<typeof createSettingsSync>[] = [];
function setup() {
  let current = settings();
  const apply = vi.fn((next: SyncedSettings) => {
    current = next;
  });
  const fetch = vi.fn(async () => document(1));
  const save = vi.fn(async (next: SyncedSettings) => document(2, next.wall.resetSeconds));
  const sync = createSettingsSync({ read: () => current, apply, fetch, save });
  controllers.push(sync);
  return {
    sync,
    apply,
    fetch,
    save,
    read: () => current,
    edit(seconds: number) {
      current = settings(seconds);
      sync.queueSave(current);
    },
  };
}
beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  controllers.splice(0).forEach(sync => sync.dispose());
  vi.useRealTimers();
});

describe('ordered settings synchronization', () => {
  it('ignores a read started before an edit, and older versions after the save', async () => {
    const test = setup();
    const old = deferred<SettingsDocument>();
    test.fetch.mockReturnValueOnce(old.promise);
    const pendingRead = test.sync.refresh();
    await vi.advanceTimersByTimeAsync(0);
    expect(test.fetch).toHaveBeenCalledOnce();
    test.edit(45);
    old.resolve(document(1, 30));
    await pendingRead;
    expect(test.read().wall.resetSeconds).toBe(45);
    expect(test.apply).not.toHaveBeenCalled();
    expect(test.save).toHaveBeenCalledWith(settings(45));
    await test.sync.refresh();
    expect(test.read().wall.resetSeconds).toBe(45);
    expect(test.apply).not.toHaveBeenCalled();
  });

  it('coalesces overlapping refreshes into one request', async () => {
    const test = setup();
    const pending = deferred<SettingsDocument>();
    test.fetch.mockReturnValueOnce(pending.promise);
    const first = test.sync.refresh();
    const second = test.sync.refresh();
    await vi.advanceTimersByTimeAsync(0);
    expect(test.fetch).toHaveBeenCalledOnce();
    pending.resolve(document(1));
    await Promise.all([first, second]);
    expect(test.apply).toHaveBeenCalledOnce();
  });

  it('serializes saves and keeps only the newest pending edit', async () => {
    const test = setup();
    await test.sync.refresh();
    const first = deferred<SettingsDocument>();
    test.save.mockReturnValueOnce(first.promise);
    test.edit(40);
    await vi.advanceTimersByTimeAsync(300);
    test.edit(50);
    test.edit(60);
    await vi.advanceTimersByTimeAsync(300);
    expect(test.save).toHaveBeenCalledTimes(1);
    first.resolve(document(2, 40));
    await test.sync.refresh();
    expect(test.save.mock.calls.map(([next]) => next.wall.resetSeconds)).toEqual([40, 60]);
    expect(test.read().wall.resetSeconds).toBe(60);
  });

  it('keeps an edit that reverts the value while an older save is in flight', async () => {
    const test = setup();
    await test.sync.refresh();
    const first = deferred<SettingsDocument>();
    test.save.mockReturnValueOnce(first.promise);
    test.edit(45);
    await vi.advanceTimersByTimeAsync(300);
    test.edit(30);
    first.resolve(document(2, 45));
    await test.sync.refresh();
    expect(test.save.mock.calls.map(([next]) => next.wall.resetSeconds)).toEqual([45, 30]);
  });

  it('retries a failed save before polling and protects the newest local copy', async () => {
    const test = setup();
    await test.sync.refresh();
    test.save.mockRejectedValueOnce(new Error('offline'));
    test.edit(45);
    await vi.advanceTimersByTimeAsync(300);
    expect(test.read().wall.resetSeconds).toBe(45);
    expect(test.fetch).toHaveBeenCalledOnce();
    test.edit(60);
    await test.sync.refresh();
    expect(test.save.mock.calls.map(([next]) => next.wall.resetSeconds)).toEqual([45, 60]);
    expect(test.read().wall.resetSeconds).toBe(60);
    expect(test.fetch).toHaveBeenCalledTimes(2);
  });

  it('captures immutable save data at the edit', async () => {
    const test = setup();
    const captured = settings(45);
    test.sync.queueSave(captured);
    captured.wall.resetSeconds = 90;
    await vi.advanceTimersByTimeAsync(300);
    expect(test.save).toHaveBeenCalledWith(settings(45));
  });

  it.each([false, true])('seeds an empty server only with dashboard authorization: %s', async (authorized) => {
    const test = setup();
    test.fetch.mockResolvedValue(document(0));
    await test.sync.refresh(authorized ? settings(45) : undefined);
    expect(test.save).toHaveBeenCalledTimes(authorized ? 1 : 0);
    if (authorized)
      expect(test.save).toHaveBeenCalledWith(settings(45));
  });

  it('retries an unauthorized seed after login without pulling over it', async () => {
    const test = setup();
    test.fetch.mockResolvedValue(document(0));
    test.save.mockRejectedValueOnce(new Error('401'));
    await test.sync.refresh(settings(45));
    expect(test.save).toHaveBeenCalledOnce();
    await test.sync.refresh(settings(45));
    expect(test.save).toHaveBeenCalledTimes(2);
    expect(test.apply).not.toHaveBeenCalled();
  });

  it('does not echo a server document back when the same settings are captured', async () => {
    const test = setup();
    test.fetch.mockResolvedValue(document(2, 45));
    await test.sync.refresh();
    test.sync.queueSave(test.read());
    await vi.advanceTimersByTimeAsync(300);
    expect(test.save).not.toHaveBeenCalled();
  });

  it('clears pending timers and ignores late reads after disposal', async () => {
    const test = setup();
    const late = deferred<SettingsDocument>();
    test.fetch.mockReturnValueOnce(late.promise);
    const read = test.sync.refresh();
    await vi.advanceTimersByTimeAsync(0);
    test.edit(45);
    test.sync.dispose();
    late.resolve(document(3, 90));
    await read;
    await vi.advanceTimersByTimeAsync(1000);
    await test.sync.refresh(settings());
    test.sync.queueSave(settings());
    expect(test.apply).not.toHaveBeenCalled();
    expect(test.save).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});
