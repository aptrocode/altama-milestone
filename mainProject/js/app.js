/* ==========================================================================
   ALTAMA Interactive Wall — Application Bootstrap & Event Handlers
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize State
  WallState.init();

  // 2. Set Up Individual Language Switchers with STRICT HOLD
  document.querySelectorAll('.lang-pill').forEach(pill => {
    const colId = parseInt(pill.dataset.col);
    pill.querySelectorAll('.lang-btn').forEach(btn => {
      let langHoldTimer = null;
      let langCompleted = false;

      const startLangHold = (e) => {
        if (e.button !== undefined && e.button !== 0) return;
        e.stopPropagation();

        langCompleted = false;
        btn.classList.add('holding');

        langHoldTimer = setTimeout(() => {
          langCompleted = true;
          btn.classList.remove('holding');
          const lang = btn.dataset.lang;
          Interactions.setColumnLanguage(colId, lang);
        }, 800); // 800ms hold to switch language
      };

      const cancelLangHold = (e) => {
        e.stopPropagation();
        if (!langCompleted) {
          btn.classList.remove('holding');
          if (langHoldTimer) {
            clearTimeout(langHoldTimer);
            langHoldTimer = null;
          }
        }
      };

      btn.addEventListener('pointerdown', startLangHold);
      btn.addEventListener('pointerup', cancelLangHold);
      btn.addEventListener('pointerleave', cancelLangHold);
      btn.addEventListener('pointercancel', cancelLangHold);

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });
  });

  // 3. Main Idle Buttons STRICT HOLD (NO entry if released midway / clicked)
  document.querySelectorAll('.main-btn').forEach(btn => {
    const colId = parseInt(btn.dataset.col);
    let holdTimer = null;
    let holdCompleted = false;

    const startHold = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      // Do not hold if clicked inside bottom bar / lang pill
      if (e.target.closest('.main-btn-bottom-bar') || e.target.closest('.lang-pill')) {
        return;
      }

      holdCompleted = false;
      btn.classList.add('holding');

      holdTimer = setTimeout(() => {
        holdCompleted = true;
        btn.classList.remove('holding');
        // Only open card when 100% full duration completed!
        Interactions.openCard(colId);
      }, WALL_CONFIG.settings.holdDuration);
    };

    const cancelHold = () => {
      if (!holdCompleted) {
        btn.classList.remove('holding');
        if (holdTimer) {
          clearTimeout(holdTimer);
          holdTimer = null;
        }
      }
    };

    btn.addEventListener('pointerdown', startHold);
    btn.addEventListener('pointerup', cancelHold);
    btn.addEventListener('pointerleave', cancelHold);
    btn.addEventListener('pointercancel', cancelHold);

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Regular click does NOTHING. Must hold full duration!
    });
  });

  // 4. Submenu Buttons STRICT HOLD (NO entry if released midway / clicked)
  document.querySelectorAll('.sub-btn').forEach(btn => {
    const colId = parseInt(btn.dataset.col);
    const subKey = btn.dataset.sub;
    let subHoldTimer = null;
    let subCompleted = false;

    const startSubHold = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      e.stopPropagation();

      subCompleted = false;
      btn.classList.add('holding');

      subHoldTimer = setTimeout(() => {
        subCompleted = true;
        btn.classList.remove('holding');
        Interactions.selectSubItem(colId, subKey);
      }, WALL_CONFIG.settings.holdDuration);
    };

    const cancelSubHold = (e) => {
      e.stopPropagation();
      if (!subCompleted) {
        btn.classList.remove('holding');
        if (subHoldTimer) {
          clearTimeout(subHoldTimer);
          subHoldTimer = null;
        }
      }
    };

    btn.addEventListener('pointerdown', startSubHold);
    btn.addEventListener('pointerup', cancelSubHold);
    btn.addEventListener('pointerleave', cancelSubHold);
    btn.addEventListener('pointercancel', cancelSubHold);

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  });

  // 6. Carousel Controls (Sensor / Touch Ready)
  document.querySelectorAll('.carousel-prev').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const colId = parseInt(btn.closest('.carousel').dataset.col);
      Carousel.prev(colId);
    });
  });

  document.querySelectorAll('.carousel-next').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const colId = parseInt(btn.closest('.carousel').dataset.col);
      Carousel.next(colId);
    });
  });

  // 7. Reset Column Timer on any user interaction within the column
  document.querySelectorAll('.column').forEach(column => {
    const colId = parseInt(column.dataset.col);
    const activityEvents = ['pointerdown', 'touchstart', 'click'];
    activityEvents.forEach(eventType => {
      column.addEventListener(eventType, () => {
        if (window.ColumnTimer) {
          window.ColumnTimer.reset(colId);
        }
      }, { passive: true });
    });
  });

  // 8. Global Keyboard Navigation (Escape returns all to idle)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      WALL_CONFIG.columns.forEach(col => {
        Interactions.resetColumnToIdle(col.id);
      });
    }
  });

  // 9. Auto-preview mockup if URL has ?preview=mockup or ?mockup=1
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get('lang');
  if (langParam && ['id', 'en', 'zh'].includes(langParam)) {
    Interactions.setLanguage(langParam);
  }

  if (window.location.search.includes('preview=mockup') || window.location.search.includes('mockup=1')) {
    // Show Col 1, 3, 4, 6 in active photo card
    WallState.setColumnState(1, 'active');
    WallState.setColumnState(3, 'active');
    WallState.setColumnState(4, 'active');
    WallState.setColumnState(6, 'active');

    // Col 2 and Col 5 in selection state (NO explanation on top yet!)
    WallState.setColumnState(2, 'submenu');
    WallState.setActiveSubItem(2, null);
    WallState.setColumnState(5, 'submenu');
    WallState.setActiveSubItem(5, null);

    WALL_CONFIG.columns.forEach(col => {
      Interactions.updateColumn(col.id);
      Interactions.updateColumnText(col.id);
    });
    Interactions.refreshAll();

    // Trigger smooth entrance animation for active columns
    [1, 3, 4, 6].forEach(colId => {
      Interactions.triggerTextEntrance(colId);
    });
  }

  console.log('✅ ALTAMA Interactive Wall initialized with kinetic typography animations.');
  console.log('🌐 Language switcher active: ID (🇮🇩), EN (🇬🇧), ZH (🇨🇳)');
  console.log('⏱️ 15-second inactivity timer enabled per column.');
});
