import { afterEach, describe, expect, it } from 'vitest';
import { effectScope, nextTick, ref } from 'vue';
import { useSettingsDraft } from '../app/composables/useSettingsDraft';

const scopes: ReturnType<typeof effectScope>[] = [];
function setup() {
  const saved = ref({ seconds: 1, nested: { enabled: true } });
  const scope = effectScope();
  scopes.push(scope);
  const form = scope.run(() => useSettingsDraft({
    saved: () => saved.value,
    defaults: { seconds: 1, nested: { enabled: true } },
    normalize: value => JSON.parse(JSON.stringify(value)) as typeof saved.value,
    save: (value) => { saved.value = value; },
  }))!;
  return { saved, ...form };
}

afterEach(() => scopes.splice(0).forEach(scope => scope.stop()));

describe('dashboard settings draft', () => {
  it('follows external replacements while clean without becoming dirty', async () => {
    const form = setup();
    form.saved.value = { seconds: 2, nested: { enabled: false } };
    await nextTick();
    expect(form.draft.value).toEqual(form.saved.value);
    expect(form.dirty.value).toBe(false);
  });

  it('follows in-place nested saves and keeps the draft detached', async () => {
    const form = setup();
    form.saved.value.nested.enabled = false;
    await nextTick();
    expect(form.draft.value.nested.enabled).toBe(false);
    expect(form.dirty.value).toBe(false);
    form.draft.value.nested.enabled = true;
    expect(form.saved.value.nested.enabled).toBe(false);
  });

  it('preserves local edits across external saves, then discards to the latest saved value', async () => {
    const form = setup();
    form.draft.value.seconds = 3;
    form.saved.value = { seconds: 2, nested: { enabled: false } };
    await nextTick();
    expect(form.draft.value.seconds).toBe(3);
    expect(form.dirty.value).toBe(true);
    form.discard();
    expect(form.draft.value).toEqual(form.saved.value);
    expect(form.dirty.value).toBe(false);
  });

  it('saves and loads defaults without changing the saved value until Save', async () => {
    const form = setup();
    form.draft.value.seconds = 3;
    form.save();
    await nextTick();
    expect(form.saved.value.seconds).toBe(3);
    expect(form.dirty.value).toBe(false);
    expect(form.status.value).toBe('Tersimpan');
    form.restoreDefaults();
    expect(form.saved.value.seconds).toBe(3);
    expect(form.draft.value.seconds).toBe(1);
    expect(form.dirty.value).toBe(true);
    form.save();
    await nextTick();
    expect(form.saved.value.seconds).toBe(1);
    expect(form.dirty.value).toBe(false);
  });
});
