/* ==========================================================================
   ALTAMA Interactive Wall — Interactions & Logic Controller
   Fluid Kinetic Motion Engine & Staggered Text Animations
   ========================================================================== */

const ColumnTimer = {
  timers: {},

  getDuration() {
    if (typeof WALL_CONFIG !== 'undefined' && WALL_CONFIG.settings && WALL_CONFIG.settings.autoResetSeconds) {
      return WALL_CONFIG.settings.autoResetSeconds * 1000;
    }
    return 15000; // 15 detik default
  },

  start(colId) {
    this.clear(colId);
    const currentState = WallState.getColumnState(colId);
    if (currentState === 'idle') return;

    const delay = this.getDuration();
    this.timers[colId] = setTimeout(() => {
      console.log(`⏱️ Column ${colId} timer expired (${delay / 1000}s). Returning to idle button.`);
      Interactions.resetColumnToIdle(colId);
    }, delay);
  },

  reset(colId) {
    const currentState = WallState.getColumnState(colId);
    if (currentState !== 'idle') {
      this.start(colId);
    }
  },

  clear(colId) {
    if (this.timers[colId]) {
      clearTimeout(this.timers[colId]);
      delete this.timers[colId];
    }
  },

  clearAll() {
    Object.keys(this.timers).forEach(id => {
      clearTimeout(this.timers[id]);
    });
    this.timers = {};
  }
};
window.ColumnTimer = ColumnTimer;

const Interactions = {

  setColumnLanguage(colId, locale) {
    WallState.setColumnLocale(colId, locale);

    // Update active flag state ONLY for this column's pill
    const pill = document.querySelector(`.lang-pill[data-col="${colId}"]`);
    if (pill) {
      pill.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === locale);
      });
    }

    // Update this column's text
    this.updateColumnText(colId);

    // If column is active, re-trigger smooth text entrance animation for new language
    const state = WallState.getColumnState(colId);
    if (state === 'active') {
      this.triggerTextEntrance(colId);
    }

    // Reset inactivity timer for this column
    if (window.ColumnTimer) {
      window.ColumnTimer.reset(colId);
    }
  },

  setLanguage(locale) {
    WALL_CONFIG.columns.forEach(col => {
      this.setColumnLanguage(col.id, locale);
    });
    this.updateZoneTop();
    this.updateZoneBottom();
  },

  updateColumnText(colId) {
    const locale = WallState.getColumnLocale(colId);
    const colData = WALL_CONFIG.getColData(colId, locale);
    if (!colData) return;

    const mainBtn = document.querySelector(`.main-btn[data-col="${colId}"] .btn-label`);
    if (mainBtn) {
      mainBtn.innerHTML = colData.labelHtml || colData.label;
    }

    const headerEl = document.querySelector(`.content-header[data-col="${colId}"]`);
    if (headerEl) {
      const titleEl = headerEl.querySelector('.content-header-title');
      const descEl = headerEl.querySelector('p');

      if (colData.type === 'expandable') {
        const subKey = WallState.getActiveSubItem(colId);
        if (subKey) {
          const subData = WALL_CONFIG.getSubData(colId, subKey, locale);
          if (titleEl) titleEl.textContent = (subData && subData.title) || colData.headerTitle;
          if (descEl) descEl.textContent = (subData && subData.desc) || colData.headerDesc;
        } else {
          if (titleEl) titleEl.textContent = colData.headerTitle;
          if (descEl) descEl.textContent = colData.headerDesc;
        }
      } else {
        if (titleEl) titleEl.textContent = colData.headerTitle;
        if (descEl) descEl.textContent = colData.headerDesc;
      }
    }

    const cardInnerTitle = document.querySelector(`.card-inner-title[data-col="${colId}"]`);
    if (cardInnerTitle) {
      if (colData.type === 'expandable') {
        const subKey = WallState.getActiveSubItem(colId);
        if (subKey) {
          const subData = WALL_CONFIG.getSubData(colId, subKey, locale);
          cardInnerTitle.textContent = (subData && subData.title) || colData.headerTitle;
        } else {
          cardInnerTitle.textContent = colData.headerTitle;
        }
      } else {
        cardInnerTitle.textContent = colData.headerTitle;
      }
    }

    const submenuHeaderTitle = document.querySelector(`.submenu-header-title[data-col="${colId}"]`);
    if (submenuHeaderTitle) {
      submenuHeaderTitle.textContent = colData.label;
    }

    if (colData.type === 'expandable' && colData.subItems) {
      colData.subItems.forEach(sub => {
        const subData = WALL_CONFIG.getSubData(colId, sub.key, locale);
        const subBtn = document.querySelector(`.sub-btn[data-col="${colId}"][data-sub="${sub.key}"] .sub-btn-title`);
        if (subBtn && subData) {
          subBtn.textContent = subData.label;
        }
      });
    }

    const bottomEl = document.querySelector(`.bottom-desc[data-col="${colId}"]`);
    if (bottomEl) {
      const bTitle = bottomEl.querySelector('h4');
      const bDesc = bottomEl.querySelector('p');
      if (colData.type === 'expandable') {
        const subKey = WallState.getActiveSubItem(colId);
        if (subKey) {
          const subData = WALL_CONFIG.getSubData(colId, subKey, locale);
          if (bTitle) bTitle.textContent = (subData && subData.title) || colData.bottomTitle;
          if (bDesc) bDesc.textContent = (subData && subData.bottomDesc) || colData.bottomDesc;
        } else {
          if (bTitle) bTitle.textContent = colData.bottomTitle;
          if (bDesc) bDesc.textContent = colData.bottomDesc;
        }
      } else {
        if (bTitle) bTitle.textContent = colData.bottomTitle;
        if (bDesc) bDesc.textContent = colData.bottomDesc;
      }
    }

    // Update photo labels in carousel
    const column = document.querySelector(`.column[data-col="${colId}"]`);
    if (column) {
      const currentTitle = (colData.type === 'expandable' && WallState.getActiveSubItem(colId)) 
        ? (WALL_CONFIG.getSubData(colId, WallState.getActiveSubItem(colId), locale)?.title || colData.headerTitle)
        : colData.headerTitle;
      column.querySelectorAll('.carousel-slide').forEach((slide, sIdx) => {
        const label = slide.querySelector('.photo-label');
        if (label) {
          label.textContent = `${currentTitle} — FOTO 0${sIdx + 1}`;
        }
      });
    }
  },

  triggerTextEntrance(colId) {
    const header = document.querySelector(`.content-header[data-col="${colId}"]`);
    if (header) {
      header.classList.remove('anim-playing');
      void header.offsetWidth; // Force CSS reflow to replay keyframes
      header.classList.add('anim-playing');
    }

    const bDesc = document.querySelector(`.bottom-desc[data-col="${colId}"]`);
    if (bDesc) {
      bDesc.classList.remove('anim-playing');
      void bDesc.offsetWidth; // Force CSS reflow
      bDesc.classList.add('anim-playing');
    }

    const activeCard = document.querySelector(`.active-content[data-col="${colId}"]`);
    if (activeCard && !activeCard.classList.contains('hidden')) {
      activeCard.classList.remove('anim-card-playing');
      void activeCard.offsetWidth; // Force CSS reflow
      activeCard.classList.add('anim-card-playing');
    }
  },

  updateZoneTop() {
    const brandingEl = document.getElementById('branding-default');
    const headersEl = document.getElementById('content-headers');

    // Check if any column is in 'active' state (photo card open)
    const hasActiveCards = Object.values(WallState.columns).some(s => s === 'active');

    if (hasActiveCards) {
      if (brandingEl) brandingEl.classList.add('hidden');
      if (headersEl) headersEl.classList.remove('hidden');

      WALL_CONFIG.columns.forEach(col => {
        const header = headersEl.querySelector(`.content-header[data-col="${col.id}"]`);
        if (!header) return;

        const state = WallState.getColumnState(col.id);
        // ONLY SHOW EXPLANATION WHEN ACTIVE (PHOTO CARD IS OPEN)!
        if (state === 'active') {
          header.classList.remove('col-hidden');
          header.classList.add('active');
        } else {
          header.classList.add('col-hidden');
          header.classList.remove('active');
          header.classList.remove('anim-playing');
        }
      });
    } else {
      if (brandingEl) brandingEl.classList.remove('hidden');
      if (headersEl) headersEl.classList.add('hidden');
      WALL_CONFIG.columns.forEach(col => {
        const header = headersEl.querySelector(`.content-header[data-col="${col.id}"]`);
        if (header) {
          header.classList.add('col-hidden');
          header.classList.remove('active');
          header.classList.remove('anim-playing');
        }
      });
    }
  },

  updateZoneBottom() {
    const bottomDescs = document.getElementById('bottom-descriptions');
    const bottomDefault = document.getElementById('bottom-default');

    const hasActiveCards = Object.values(WallState.columns).some(s => s === 'active');

    if (hasActiveCards) {
      if (bottomDefault) bottomDefault.classList.add('hidden');
      if (bottomDescs) bottomDescs.classList.remove('hidden');

      WALL_CONFIG.columns.forEach(col => {
        const desc = bottomDescs.querySelector(`.bottom-desc[data-col="${col.id}"]`);
        if (!desc) return;

        const state = WallState.getColumnState(col.id);
        // ONLY SHOW BOTTOM EXPLANATION WHEN ACTIVE!
        if (state === 'active') {
          desc.classList.remove('col-hidden');
          desc.classList.add('active');
        } else {
          desc.classList.add('col-hidden');
          desc.classList.remove('active');
          desc.classList.remove('anim-playing');
        }
      });
    } else {
      if (bottomDefault) bottomDefault.classList.remove('hidden');
      if (bottomDescs) bottomDescs.classList.add('hidden');
      WALL_CONFIG.columns.forEach(col => {
        const desc = bottomDescs.querySelector(`.bottom-desc[data-col="${col.id}"]`);
        if (desc) {
          desc.classList.add('col-hidden');
          desc.classList.remove('active');
          desc.classList.remove('anim-playing');
        }
      });
    }
  },

  updateColumnBorders() {
    const bordersEl = document.getElementById('column-borders');
    if (!bordersEl) return;

    if (WallState.hasAnyActive()) {
      bordersEl.classList.remove('hidden');
    } else {
      bordersEl.classList.add('hidden');
    }
  },

  refreshAll() {
    this.updateZoneTop();
    this.updateZoneBottom();
    this.updateColumnBorders();
  },

  resetColumnToIdle(colId) {
    ColumnTimer.clear(colId);
    WallState.resetColumn(colId);
    this.updateColumn(colId);
    this.updateColumnText(colId);
    this.refreshAll();
  },

  updateColumn(colId) {
    const column = document.querySelector(`.column[data-col="${colId}"]`);
    if (!column) return;

    const state = WallState.getColumnState(colId);
    const btnGroup = column.querySelector('.btn-group');
    const submenuGroup = column.querySelector('.submenu-group');
    const activeContent = column.querySelector('.active-content');

    switch (state) {
      case 'idle':
        if (btnGroup) btnGroup.classList.remove('hidden');
        if (submenuGroup) submenuGroup.classList.add('hidden');
        if (activeContent) {
          activeContent.classList.add('hidden');
          activeContent.classList.remove('anim-card-playing');
        }
        break;

      case 'submenu':
        if (btnGroup) btnGroup.classList.add('hidden');
        if (submenuGroup) submenuGroup.classList.remove('hidden');
        if (activeContent) {
          activeContent.classList.add('hidden');
          activeContent.classList.remove('anim-card-playing');
        }
        if (submenuGroup) {
          submenuGroup.querySelectorAll('.sub-btn').forEach(btn => {
            btn.classList.remove('active-sub');
          });
        }
        break;

      case 'active':
        if (btnGroup) btnGroup.classList.add('hidden');
        if (submenuGroup) submenuGroup.classList.add('hidden');
        if (activeContent) activeContent.classList.remove('hidden');
        break;
    }
  },

  openCard(colId) {
    const col = WALL_CONFIG.columns.find(c => c.id === colId);
    if (!col) return;

    if (col.type === 'expandable') {
      // First open the choices menu without any explanation yet!
      WallState.setColumnState(colId, 'submenu');
      WallState.setActiveSubItem(colId, null);
    } else {
      WallState.setColumnState(colId, 'active');
    }

    this.updateColumn(colId);
    this.updateColumnText(colId);
    this.refreshAll();
    
    if (WallState.getColumnState(colId) === 'active') {
      this.triggerTextEntrance(colId);
    }
    ColumnTimer.start(colId);
  },

  selectSubItem(colId, subKey) {
    WallState.setActiveSubItem(colId, subKey);
    // User selected the item -> IMAGE CAROUSEL CARD OPENS!
    WallState.setColumnState(colId, 'active');

    // Reset carousel index to 0
    Carousel.goTo(colId, 0);

    this.updateColumn(colId);
    this.updateColumnText(colId);
    this.refreshAll();
    this.triggerTextEntrance(colId);
    ColumnTimer.reset(colId);
  },

  returnToSubmenu(colId) {
    const col = WALL_CONFIG.columns.find(c => c.id === colId);
    if (!col || col.type !== 'expandable') return;

    WallState.setColumnState(colId, 'submenu');
    WallState.setActiveSubItem(colId, null);
    this.updateColumn(colId);
    this.updateColumnText(colId);
    this.refreshAll();
    ColumnTimer.reset(colId);
  },

  closeCard(colId) {
    this.resetColumnToIdle(colId);
  }
};
