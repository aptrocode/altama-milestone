export default defineNuxtPlugin((nuxtApp) => {
  const HOLD_DURATION = 1000; // 1 second hold requirement

  nuxtApp.vueApp.directive('hold', {
    mounted(el: HTMLElement, binding) {
      let holdTimer: ReturnType<typeof setTimeout> | null = null;
      let triggered = false;

      const fireAction = () => {
        el.classList.remove('holding');
        el.classList.add('hold-complete');

        if (typeof binding.value === 'function') {
          binding.value();
        }

        setTimeout(() => {
          el.classList.remove('hold-complete');
        }, 400);
      };

      const startHold = (e: Event) => {
        // If clicking on language switcher or other interactive controls, ignore
        if (
          (e.target as HTMLElement)?.closest('.col-lang-switcher')
          || (e.target as HTMLElement)?.closest('.submenu-close-btn')
          || (e.target as HTMLElement)?.closest('.active-close-btn')
        ) {
          return;
        }

        triggered = false;
        el.classList.remove('hold-complete');
        el.classList.add('holding');

        if (holdTimer)
          clearTimeout(holdTimer);

        holdTimer = setTimeout(() => {
          triggered = true;
          holdTimer = null;
          fireAction();
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
        if (!triggered) {
          el.classList.remove('hold-complete');
        }
      };

      el.addEventListener('mousedown', startHold);
      el.addEventListener('mouseup', cancelHold);
      el.addEventListener('mouseleave', cancelHold);

      el.addEventListener('touchstart', startHold, { passive: true });
      el.addEventListener('touchend', cancelHold);
      el.addEventListener('touchcancel', cancelHold);

      el.addEventListener('click', (e) => {
        // Prevent instant trigger on click; require full 3-second hold
        e.preventDefault();
        e.stopPropagation();
      });

      // Cleanup
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
