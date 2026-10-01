/* ==========================================================================
   ALTAMA Interactive Wall — Interaction Handler
   ========================================================================== */

const Interactions = {
  _idleTimer: null,

  /** Show/hide branding vs content headers in zone-top */
  updateZoneTop() {
    const brandingEl = document.getElementById('branding-default');
    const headersEl = document.getElementById('content-headers');
    if (!brandingEl || !headersEl) return;

    if (WallState.hasAnyActive()) {
      brandingEl.classList.add('hidden');
      headersEl.classList.remove('hidden');

      COLUMNS_DATA.forEach(col => {
        const header = headersEl.querySelector(`.content-header[data-col="${col.id}"]`);
        if (!header) return;

        if (WallState.getColumnState(col.id) === 'active') {
          header.classList.remove('col-hidden');
          header.classList.add('active', 'anim-slide-down');
        } else {
          header.classList.add('col-hidden');
          header.classList.remove('active', 'anim-slide-down');
        }
      });
    } else {
      brandingEl.classList.remove('hidden');
      headersEl.classList.add('hidden');
    }
  },

  /** Show/hide bottom descriptions */
  updateZoneBottom() {
    const bottomDescs = document.getElementById('bottom-descriptions');
    if (!bottomDescs) return;

    if (WallState.hasAnyActive()) {
      bottomDescs.classList.remove('hidden');

      COLUMNS_DATA.forEach(col => {
        const desc = bottomDescs.querySelector(`.bottom-desc[data-col="${col.id}"]`);
        if (!desc) return;

        if (WallState.getColumnState(col.id) === 'active') {
          desc.classList.remove('col-hidden');
        } else {
          desc.classList.add('col-hidden');
        }
      });
    } else {
      bottomDescs.classList.add('hidden');
    }
  },

  /** Show/hide column border overlays */
  updateColumnBorders() {
    const bordersEl = document.getElementById('column-borders');
    if (!bordersEl) return;

    if (WallState.hasAnyActive()) {
      bordersEl.classList.remove('hidden');
    } else {
      bordersEl.classList.add('hidden');
    }
  },

  /** Update a specific column's DOM based on its state */
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
        if (activeContent) activeContent.classList.add('hidden');
        break;

      case 'submenu':
        if (btnGroup) btnGroup.classList.add('hidden');
        if (submenuGroup) {
          submenuGroup.classList.remove('hidden');
          submenuGroup.classList.add('anim-fade-in');
        }
        if (activeContent) activeContent.classList.add('hidden');
        break;

      case 'active':
        if (btnGroup) btnGroup.classList.add('hidden');
        if (submenuGroup) submenuGroup.classList.add('hidden');
        if (activeContent) {
          activeContent.classList.remove('hidden');
          activeContent.classList.add('anim-scale-in');
        }
        CarouselController.reset(colId);
        break;
    }
  },

  /** Refresh all zones after any state change */
  refreshAll() {
    this.updateZoneTop();
    this.updateZoneBottom();
    this.updateColumnBorders();
    this.resetIdleTimer();
  },

  /** Handle main button click/hold */
  onMainButtonClick(colId) {
    const col = COLUMNS_DATA.find(c => c.id === colId);
    if (!col) return;

    const currentState = WallState.getColumnState(colId);

    if (col.type === 'expandable') {
      if (currentState === 'idle') {
        WallState.setColumnState(colId, 'submenu');
      } else if (currentState === 'submenu') {
        WallState.setColumnState(colId, 'idle');
      } else if (currentState === 'active') {
        WallState.setColumnState(colId, 'submenu');
      }
    } else {
      if (currentState === 'idle') {
        WallState.setColumnState(colId, 'active');
      } else {
        WallState.setColumnState(colId, 'idle');
        WallState.setCarouselIndex(colId, 0);
      }
    }

    this.updateColumn(colId);
    this.updateHeaderContent(colId);
    this.updateBottomContent(colId);
    this.refreshAll();
  },

  /** Handle sub-menu button click/hold */
  onSubButtonClick(colId, subKey) {
    WallState.setActiveSubItem(colId, subKey);
    WallState.setColumnState(colId, 'active');

    this.updateHeaderContent(colId);
    this.updateBottomContent(colId);
    this.updateColumn(colId);
    this.refreshAll();
  },

  /** Update header title and desc dynamically */
  updateHeaderContent(colId) {
    const col = COLUMNS_DATA.find(c => c.id === colId);
    if (!col) return;

    let title = col.headerTitle;
    let desc = col.headerDesc;

    if (col.type === 'expandable') {
      const activeKey = WallState.getActiveSubItem(colId);
      const sub = col.subItems?.find(s => s.key === activeKey);
      if (sub) {
        title = sub.headerTitle;
        desc = sub.headerDesc;
      }
    }

    WallRenderer.updateHeader(colId, title, desc);
  },

  /** Update bottom description title and desc dynamically */
  updateBottomContent(colId) {
    const col = COLUMNS_DATA.find(c => c.id === colId);
    if (!col) return;

    let title = col.bottomTitle;
    let desc = col.bottomDesc;

    if (col.type === 'expandable') {
      const activeKey = WallState.getActiveSubItem(colId);
      const sub = col.subItems?.find(s => s.key === activeKey);
      if (sub) {
        title = sub.bottomTitle;
        desc = sub.bottomDesc;
      }
    }

    WallRenderer.updateBottomDesc(colId, title, desc);
  },

  /** Mark clicked sub-button as active */
  highlightSubButton(colId, subKey) {
    const submenuGroup = document.querySelector(`.submenu-group[data-col="${colId}"]`);
    if (!submenuGroup) return;

    submenuGroup.querySelectorAll('.sub-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.sub === subKey);
    });
  },

  /** Auto-reset timer for public kiosks */
  resetIdleTimer() {
    if (!APP_SETTINGS.autoResetIdleTime || APP_SETTINGS.autoResetIdleTime <= 0) return;

    if (this._idleTimer) clearTimeout(this._idleTimer);
    this._idleTimer = setTimeout(() => {
      console.log('⏰ Auto-reset: Kiosk idle timeout reached, resetting to standby.');
      WallState.resetAll();
      COLUMNS_DATA.forEach(col => {
        this.updateColumn(col.id);
      });
      this.refreshAll();
    }, APP_SETTINGS.autoResetIdleTime);
  },
};

