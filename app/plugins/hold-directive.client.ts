export default defineNuxtPlugin((nuxtApp) => {
  const HOLD_DURATION = 800;

  nuxtApp.vueApp.directive('hold', {
    mounted(el: HTMLElement, binding) {
      let holdTimer: ReturnType<typeof setTimeout> | null = null;
      let startTime = 0;
      let triggered = false;
      let lastTriggerTime = 0;

      const fireAction = () => {
        const now = Date.now();
        // Prevent duplicate trigger within 350ms
        if (now - lastTriggerTime < 350)
          return;
        lastTriggerTime = now;

        el.classList.remove('holding');
        el.classList.add('hold-complete');

        if (typeof binding.value === 'function') {
          binding.value();
        }

        setTimeout(() => {
          el.classList.remove('hold-complete');
        }, 350);
      };

      const startHold = (e: Event) => {
        // If clicking on language switcher or other interactive controls, ignore
        if ((e.target as HTMLElement)?.closest('.col-lang-switcher'))
          return;

        startTime = Date.now();
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

      const endHold = (e?: Event) => {
        if (e)
          e.stopPropagation();

        if (holdTimer) {
          clearTimeout(holdTimer);
          holdTimer = null;
        }

        const elapsed = Date.now() - startTime;
        el.classList.remove('holding');

        // If released before hold threshold and not yet triggered, it is a tap!
        if (!triggered && elapsed < HOLD_DURATION && startTime > 0) {
          triggered = true;
          fireAction();
        }
        startTime = 0;
      };

      const cancelHold = (e?: Event) => {
        if (e)
          e.stopPropagation();
        if (holdTimer) {
          clearTimeout(holdTimer);
          holdTimer = null;
        }
        startTime = 0;
        el.classList.remove('holding');
        el.classList.remove('hold-complete');
      };

      el.addEventListener('mousedown', startHold);
      el.addEventListener('mouseup', endHold);
      el.addEventListener('mouseleave', cancelHold);

      el.addEventListener('touchstart', startHold, { passive: true });
      el.addEventListener('touchend', endHold);
      el.addEventListener('touchcancel', cancelHold);

      el.addEventListener('click', (e) => {
        // Prevent default browser click navigation but ensure action fires if not already handled
        e.preventDefault();
        e.stopPropagation();
        const now = Date.now();
        if (now - lastTriggerTime > 350) {
          fireAction();
        }
      });

      // Cleanup
      (el as any)._holdCleanup = () => {
        cancelHold();
        el.removeEventListener('mousedown', startHold);
        el.removeEventListener('mouseup', endHold);
        el.removeEventListener('mouseleave', cancelHold);
        el.removeEventListener('touchstart', startHold);
        el.removeEventListener('touchend', endHold);
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
