import type { Ref } from 'vue';
import { computed, ref, watch } from 'vue';

export interface SettingsDraftOptions<T> {
  /** The saved value (store state). */
  saved: () => T;
  /** Clamp/complete any value into a valid one; also used to copy. */
  normalize: (value: unknown) => T;
  defaults: T;
  /** Persist an edited value. */
  save: (value: T) => void;
}

/**
 * Editable copy of a dashboard setting group: `dirty` compares against the saved value, the draft
 * follows changes from another tab or an import unless the operator is editing, `save` /
 * `restoreDefaults` report their result in `status`, and `discard` drops unsaved edits.
 */
export function useSettingsDraft<T>(options: SettingsDraftOptions<T>) {
  const copy = (value: unknown): T => options.normalize(JSON.parse(JSON.stringify(value)));
  const serialized = (value: unknown) => JSON.stringify(options.normalize(value));
  const draft = ref(copy(options.saved())) as Ref<T>;
  const status = ref('');
  const dirty = computed(() => serialized(draft.value) !== serialized(options.saved()));

  // A string snapshot keeps the previous baseline intact even for in-place nested updates.
  // Comparing dirty against the NEW saved value would make a previously clean form look edited.
  watch(() => serialized(options.saved()), (next, previous) => {
    if (serialized(draft.value) === previous)
      draft.value = copy(JSON.parse(next));
  });

  function save() {
    options.save(draft.value);
    draft.value = copy(options.saved());
    status.value = 'Tersimpan';
  }

  function discard() {
    draft.value = copy(options.saved());
    status.value = '';
  }

  function restoreDefaults() {
    draft.value = copy(options.defaults);
    status.value = 'Default dimuat, klik Simpan';
  }

  return { draft, dirty, status, save, discard, restoreDefaults };
}
