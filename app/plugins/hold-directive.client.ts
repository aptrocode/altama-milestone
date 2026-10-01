import type { ObjectDirective } from 'vue';
import { bindHold } from '~/utils/hold';

const bindings = new WeakMap<HTMLElement, ReturnType<typeof bindHold>>();

const holdDirective: ObjectDirective<HTMLElement, () => void> = {
  mounted(element, binding) {
    bindings.set(element, bindHold(element, binding.value));
  },
  updated(element, binding) {
    bindings.get(element)?.update(binding.value);
  },
  unmounted(element) {
    bindings.get(element)?.dispose();
    bindings.delete(element);
  },
};

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('hold', holdDirective);
});
