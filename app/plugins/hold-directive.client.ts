export default defineNuxtPlugin((nuxtApp) => {
  const HOLD_DURATION = 1000;

  nuxtApp.vueApp.directive('hold', {
    mounted(el: HTMLElement, binding) {
      let holdTimer: ReturnType<typeof setTimeout> | null = null;

      const startHold = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        if (holdTimer)
          return;

        el.classList.remove('hold-complete');
        el.classList.add('holding');

        holdTimer = setTimeout(() => {
          el.classList.remove('holding');
          el.classList.add('hold-complete');

          if (typeof binding.value === 'function') {
            binding.value();
          }

          setTimeout(() => {
            el.classList.remove('hold-complete');
          }, 350);

          holdTimer = null;
        }, HOLD_DURATION);
      };

      const cancelHold = (e?: Event) => {
        if (e)
          e.stopPropagation();
        if (holdTimer) {
          clearTimeout(holdTimer);
          holdTimer = null;
        }
        el.classList.remove('holding');
        el.classList.remove('hold-complete');
      };

      el.addEventListener('mousedown', startHold);
      el.addEventListener('mouseup', cancelHold);
      el.addEventListener('mouseleave', cancelHold);

      el.addEventListener('touchstart', startHold, { passive: false });
      el.addEventListener('touchend', cancelHold);
      el.addEventListener('touchcancel', cancelHold);

      el.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });

      // Store cleanup function on element
      (el as any)._holdCleanup = () => {
        cancelHold();
        el.removeEventListener('mousedown', startHold);
        el.removeEventListener('mouseup', cancelHold);
        el.removeEventListener('mouseleave', cancelHold);
        el.removeEventListener('touchstart', startHold);
        el.removeEventListener('touchend', cancelHold);
        el.removeEventListener('touchcancel', cancelHold);
      };
    },

    unmounted(el: HTMLElement) {
      if ((el as any)._holdCleanup) {
        (el as any)._holdCleanup();
      }
    },
  });
});
