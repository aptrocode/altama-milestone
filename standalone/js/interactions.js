/* ============================================
   ALTAMA Interactive Wall — Interaction Handler
   ============================================
   Handles all click events, state transitions,
   and DOM updates for the interactive wall.

   IMPORTANT: For column-aligned elements (content
   headers, bottom descriptions), we use 'col-hidden'
   (visibility:hidden) instead of 'hidden' (display:none)
   so that inactive columns still occupy their flex
   space and content stays aligned to its column.
   ============================================ */

const Interactions = {

  /** Show/hide branding vs content headers in zone-top */
  updateZoneTop() {
    const brandingEl = document.getElementById('branding-default');
    const headersEl = document.getElementById('content-headers');

    if (WallState.hasAnyActive()) {
      brandingEl.classList.add('hidden');
      headersEl.classList.remove('hidden');

      // Use col-hidden (visibility) to keep column alignment
      WALL_CONFIG.columns.forEach(col => {
        const header = headersEl.querySelector(`.content-header[data-col="${col.id}"]`);
        if (!header) return;

        if (WallState.getColumnState(col.id) === 'active') {
          header.classList.remove('col-hidden');
          header.classList.add('active');
          header.classList.add('anim-slide-down');
        } else {
          header.classList.add('col-hidden');
          header.classList.remove('active');
          header.classList.remove('anim-slide-down');
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

    if (WallState.hasAnyActive()) {
      bottomDescs.classList.remove('hidden');

      // Use col-hidden (visibility) to keep column alignment
      WALL_CONFIG.columns.forEach(col => {
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
  },

  /** Handle main button click */
  onMainButtonClick(colId) {
    const colConfig = WALL_CONFIG.columns.find(c => c.id === colId);
    if (!colConfig) return;

    const currentState = WallState.getColumnState(colId);

    if (colConfig.type === 'expandable') {
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
        WallState.carouselIndex[colId] = 0;
      }
    }

    this.updateColumn(colId);
    this.updateHeaderContent(colId);
    this.updateBottomContent(colId);
    this.refreshAll();
  },

  /** Handle sub-menu button click */
  onSubButtonClick(colId, subKey) {
    WallState.setActiveSubItem(colId, subKey);
    WallState.setColumnState(colId, 'active');

    this.updateHeaderContent(colId);
    this.updateBottomContent(colId);
    this.updateColumn(colId);
    this.refreshAll();
  },

  /** Update the header content title/text for a column based on active sub-item */
  updateHeaderContent(colId) {
    const colConfig = WALL_CONFIG.columns.find(c => c.id === colId);
    if (!colConfig) return;

    const headerTitle = document.querySelector(`.content-header-title[data-col="${colId}"]`);
    const headerEl = document.querySelector(`.content-header[data-col="${colId}"]`);

    if (colConfig.type === 'expandable') {
      const subKey = WallState.getActiveSubItem(colId);
      const subContent = WALL_CONFIG.subItemContent[subKey];
      if (subContent && headerTitle) {
        headerTitle.textContent = subContent.title;
      }
      if (subContent && headerEl) {
        const p = headerEl.querySelector('p');
        if (p) p.textContent = subContent.desc;
      }
    }
  },

  /** Update the bottom description for a column */
  updateBottomContent(colId) {
    const colConfig = WALL_CONFIG.columns.find(c => c.id === colId);
    if (!colConfig) return;

    const bottomTitle = document.querySelector(`.bottom-desc-title[data-col="${colId}"]`);

    if (colConfig.type === 'expandable') {
      const subKey = WallState.getActiveSubItem(colId);
      const subContent = WALL_CONFIG.subItemContent[subKey];
      if (subContent && bottomTitle) {
        bottomTitle.textContent = subContent.title;
      }
    }
  },

  /** Mark clicked sub-button as active and remove from siblings */
  highlightSubButton(colId, subKey) {
    const submenuGroup = document.querySelector(`.submenu-group[data-col="${colId}"]`);
    if (!submenuGroup) return;

    submenuGroup.querySelectorAll('.sub-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.sub === subKey);
    });
  },
};
