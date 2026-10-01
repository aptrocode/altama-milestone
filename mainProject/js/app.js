/* ============================================
   ALTAMA Interactive Wall — App Entry Point
   ============================================
   Initializes state and binds all event listeners.

   Buttons use HOLD-TO-ACTIVATE (1 second):
   - Main buttons: press & hold 1s with neon outline
   - Sub-menu buttons (TEKIRO, RYU, REXCO, etc.):
     press & hold 1s with neon outline
   - Carousel navigation buttons (←, →):
     press & hold 1s with neon outline
   - Release early = cancel
   ============================================ */

const HOLD_DURATION = 1000; // 1 second

/**
 * Global helper: Attach 1-second hold-to-activate behavior to any button.
 * Shows glowing outline animation while holding.
 * If released before 1s, it cancels.
 */
window.attachHoldToActivate = function attachHoldToActivate(button, onComplete) {
  let holdTimer = null;

  const startHold = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (holdTimer) return;

    // Reset 15s inactivity timer for this column on interaction
    const colEl = button.closest('.column') || (button.dataset.col ? document.querySelector(`.column[data-col="${button.dataset.col}"]`) : null);
    if (colEl && window.ColumnTimer) {
      const cId = parseInt(colEl.dataset.col, 10);
      if (cId) window.ColumnTimer.reset(cId);
    }

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
    }, HOLD_DURATION);
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

  // Touch events (for touch / sensor screens)
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
  // Initialize state
  WallState.init();

  // ── Hold-to-Activate for Main Buttons ──
  document.querySelectorAll('.main-btn').forEach(btn => {
    window.attachHoldToActivate(btn, () => {
      const colId = parseInt(btn.dataset.col, 10);
      Interactions.onMainButtonClick(colId);
    });
  });

  // ── Hold-to-Activate for Sub-Menu Buttons (TEKIRO, RYU, REXCO, etc.) ──
  document.querySelectorAll('.sub-btn').forEach(btn => {
    window.attachHoldToActivate(btn, () => {
      const colId = parseInt(btn.dataset.col, 10);
      const subKey = btn.dataset.sub;
      Interactions.highlightSubButton(colId, subKey);
      Interactions.onSubButtonClick(colId, subKey);
    });
  });

  // ── Bind Carousel Controls (also with Hold-to-Activate) ──
  WALL_CONFIG.columns.forEach(col => {
    CarouselController.bindEvents(col.id);
  });

  // ── Per-Column Area Interaction Listeners (Reset 15s Timer back to 15s) ──
  document.querySelectorAll('.column').forEach(colEl => {
    const colId = parseInt(colEl.dataset.col, 10);
    ['pointerdown', 'touchstart', 'mousedown'].forEach(evtType => {
      colEl.addEventListener(evtType, () => {
        if (window.ColumnTimer) {
          window.ColumnTimer.reset(colId);
        }
      }, { capture: true, passive: true });
    });
  });

  // Also bind to header and footer of each column
  WALL_CONFIG.columns.forEach(col => {
    const header = document.querySelector(`.content-header[data-col="${col.id}"]`);
    if (header) {
      ['pointerdown', 'touchstart', 'mousedown'].forEach(evtType => {
        header.addEventListener(evtType, () => {
          if (window.ColumnTimer) window.ColumnTimer.reset(col.id);
        }, { capture: true, passive: true });
      });
    }
    const footer = document.querySelector(`.bottom-desc[data-col="${col.id}"]`);
    if (footer) {
      ['pointerdown', 'touchstart', 'mousedown'].forEach(evtType => {
        footer.addEventListener(evtType, () => {
          if (window.ColumnTimer) window.ColumnTimer.reset(col.id);
        }, { capture: true, passive: true });
      });
    }
  });

  // ── Keyboard shortcut: Escape to reset all ──
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.code === 'KeyR') {
      if (window.ColumnTimer) window.ColumnTimer.clearAll();
      WallState.resetAll();
      WALL_CONFIG.columns.forEach(col => {
        Interactions.updateColumn(col.id);
      });
      Interactions.refreshAll();
    }
  });

  console.log('✅ ALTAMA Interactive Wall initialized.');
  console.log('⏱️ Inactivity timer active: 15 seconds per column.');
  console.log('💡 Hold buttons for 1 second to activate (Main, Submenu, Carousel buttons).');
  console.log('💡 Press ESC to reset all columns to idle state.');
});
