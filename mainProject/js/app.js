/* ==========================================================================
   ALTAMA Interactive Wall — Application Entry Point
   ========================================================================== */

/**
 * Global helper: Attach 1-second hold-to-activate behavior to any button.
 * - Shows glowing outline animation while holding.
 * - If released before duration expires, it cancels safely.
 * - Supports both Touch Screen & Mouse inputs.
 */
window.attachHoldToActivate = function attachHoldToActivate(button, onComplete) {
  let holdTimer = null;
  const duration = (typeof APP_SETTINGS !== 'undefined' && APP_SETTINGS.holdDuration)
    ? APP_SETTINGS.holdDuration
    : 1000;

  const startHold = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (holdTimer) return;

    button.classList.remove('hold-complete');
    button.classList.add('holding');

    holdTimer = setTimeout(() => {
      button.classList.remove('holding');
      button.classList.add('hold-complete');

      onComplete();

      setTimeout(() => {
        button.classList.remove('hold-complete');
      }, 350);

      holdTimer = null;
    }, duration);
  };

  const cancelHold = (e) => {
    if (e) e.stopPropagation();
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }
    button.classList.remove('holding');
    button.classList.remove('hold-complete');
  };

  // Mouse events
  button.addEventListener('mousedown', startHold);
  button.addEventListener('mouseup', cancelHold);
  button.addEventListener('mouseleave', cancelHold);

  // Touch events (for touch screens / sensor walls)
  button.addEventListener('touchstart', startHold, { passive: false });
  button.addEventListener('touchend', cancelHold);
  button.addEventListener('touchcancel', cancelHold);

  // Prevent default click
  button.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
};

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize application state
  WallState.init();

  // 2. Initialize dynamic carousel slides & indicators
  WallRenderer.initAllCarousels();

  // 3. Bind Hold-to-Activate on Main Buttons (1-6)
  document.querySelectorAll('.main-btn').forEach(btn => {
    window.attachHoldToActivate(btn, () => {
      const colId = parseInt(btn.dataset.col, 10);
      Interactions.onMainButtonClick(colId);
    });
  });

  // 4. Bind Hold-to-Activate on Sub-Menu Buttons (TEKIRO, RYU, REXCO, etc.)
  document.querySelectorAll('.sub-btn').forEach(btn => {
    window.attachHoldToActivate(btn, () => {
      const colId = parseInt(btn.dataset.col, 10);
      const subKey = btn.dataset.sub;
      Interactions.highlightSubButton(colId, subKey);
      Interactions.onSubButtonClick(colId, subKey);
    });
  });

  // 5. Bind Carousel Navigation Controls (← and →)
  COLUMNS_DATA.forEach(col => {
    CarouselController.bindEvents(col.id);
  });

  // 6. Keyboard shortcuts (Escape/R = reset, 1-6 = toggle column)
  if (APP_SETTINGS.enableKeyboardShortcuts) {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.code === 'KeyR') {
        WallState.resetAll();
        COLUMNS_DATA.forEach(col => {
          Interactions.updateColumn(col.id);
        });
        Interactions.refreshAll();
      }

      if (!e.repeat && ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6'].includes(e.code)) {
        const colId = parseInt(e.code.replace('Digit', ''), 10);
        Interactions.onMainButtonClick(colId);
      }
    });
  }

  // 7. Track global user activity to restart idle timer
  ['mousedown', 'touchstart', 'keydown'].forEach(evt => {
    window.addEventListener(evt, () => Interactions.resetIdleTimer(), { passive: true });
  });

  console.log('✅ ALTAMA Interactive Wall initialized.');
  console.log('💡 Edit content easily in: js/config.js');
  console.log(`⏱️ Hold duration: ${APP_SETTINGS.holdDuration}ms.`);
  console.log('⌨️ Shortcuts: Press 1-6 to toggle columns, ESC to reset all.');
});
