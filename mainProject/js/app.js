/* ==========================================================================
   ALTAMA Interactive Wall — Application Bootstrap & Event Handlers
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize State
  WallState.init();

  // 2. Set Up Individual Language Switchers (Independent per Column)
  document.querySelectorAll('.lang-pill').forEach(pill => {
    const colId = parseInt(pill.dataset.col);
    pill.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const lang = btn.dataset.lang;
        Interactions.setColumnLanguage(colId, lang);
      });
    });
  });

  // 3. Main Idle Buttons Click / Hold
  document.querySelectorAll('.main-btn').forEach(btn => {
    const colId = parseInt(btn.dataset.col);

    btn.addEventListener('click', () => {
      Interactions.openCard(colId);
    });

    let holdTimer = null;
    btn.addEventListener('pointerdown', (e) => {
      btn.classList.add('holding');
      holdTimer = setTimeout(() => {
        btn.classList.remove('holding');
        Interactions.openCard(colId);
      }, WALL_CONFIG.settings.holdDuration);
    });

    const cancelHold = () => {
      btn.classList.remove('holding');
      if (holdTimer) {
        clearTimeout(holdTimer);
        holdTimer = null;
      }
    };
    btn.addEventListener('pointerup', cancelHold);
    btn.addEventListener('pointerleave', cancelHold);
    btn.addEventListener('pointercancel', cancelHold);
  });

  // 4. Submenu Buttons
  document.querySelectorAll('.sub-btn').forEach(btn => {
    const colId = parseInt(btn.dataset.col);
    const subKey = btn.dataset.sub;

    btn.addEventListener('click', () => {
      Interactions.selectSubItem(colId, subKey);
    });

    let holdTimer = null;
    btn.addEventListener('pointerdown', () => {
      btn.classList.add('holding');
      holdTimer = setTimeout(() => {
        btn.classList.remove('holding');
        Interactions.selectSubItem(colId, subKey);
      }, WALL_CONFIG.settings.holdDuration);
    });

    const cancelHold = () => {
      btn.classList.remove('holding');
      if (holdTimer) {
        clearTimeout(holdTimer);
        holdTimer = null;
      }
    };
    btn.addEventListener('pointerup', cancelHold);
    btn.addEventListener('pointerleave', cancelHold);
    btn.addEventListener('pointercancel', cancelHold);
  });

  // 5. Carousel Controls (Sensor / Touch Ready)
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

  // 6. Reset Column Timer on any user interaction within the column
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

  // 7. Global Keyboard Navigation (For Testing & Accessibility)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      WALL_CONFIG.columns.forEach(col => {
        Interactions.resetColumnToIdle(col.id);
      });
    }
  });

  // 8. Auto-preview mockup if URL has ?preview=mockup or ?mockup=1
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get('lang');
  if (langParam && ['id', 'en', 'zh'].includes(langParam)) {
    Interactions.setLanguage(langParam);
  }

  if (window.location.search.includes('preview=mockup') || window.location.search.includes('mockup=1')) {
    WallState.setColumnState(1, 'active');
    WallState.setColumnState(2, 'submenu');
    WallState.setActiveSubItem(2, 'ryu');
    WallState.setColumnState(3, 'idle');
    WallState.setColumnState(4, 'idle');
    WallState.setColumnState(5, 'idle');
    WallState.setColumnState(6, 'active');

    WALL_CONFIG.columns.forEach(col => {
      Interactions.updateColumn(col.id);
      Interactions.updateColumnText(col.id);
    });
    Interactions.refreshAll();
  }

  console.log('✅ ALTAMA Interactive Wall initialized.');
  console.log('🌐 Language switcher active: ID (🇮🇩), EN (🇬🇧), ZH (🇨🇳)');
  console.log('⏱️ 15-second inactivity timer enabled per column.');
});
