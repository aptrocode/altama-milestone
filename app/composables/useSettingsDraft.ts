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
 * follows changes from another tab or an import unless the operator is editing, and `save` /
 * `restoreDefaults` report their result in `status`.
 */
export function useSettingsDraft<T>(options: SettingsDraftOptions<T>) {
  const copy = (value: unknown): T => options.normalize(JSON.parse(JSON.stringify(value)));
  const draft = ref(copy(options.saved())) as Ref<T>;
  const status = ref('');
  const dirty = computed(() => JSON.stringify(options.normalize(draft.value)) !== JSON.stringify(options.saved()));

  watch(options.saved, (next) => {
    if (!dirty.value)
      draft.value = copy(next);
  }, { deep: true });

  function save() {
    options.save(draft.value);
    draft.value = copy(options.saved());
    status.value = 'Tersimpan';
  }

  function restoreDefaults() {
    draft.value = copy(options.defaults);
    status.value = 'Default dimuat, klik Simpan';
  }

  return { draft, dirty, status, save, restoreDefaults };
}
