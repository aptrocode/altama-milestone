/* ==========================================================================
   ALTAMA Interactive Wall — State Manager (Independent Per-Column Translation)
   ========================================================================== */

const WallState = {
  columnLocales: { 1: 'id', 2: 'id', 3: 'id', 4: 'id', 5: 'id', 6: 'id' },
  columns: {},         // { 1: 'idle', 2: 'submenu', ... }
  activeSubItem: {},   // { 2: null, 5: null }
  carouselIndex: {},   // { 1: 0, 2: 0, ... }

  init() {
    WALL_CONFIG.columns.forEach(col => {
      this.columnLocales[col.id] = 'id';
      this.columns[col.id] = 'idle';
      this.carouselIndex[col.id] = 0;
      this.activeSubItem[col.id] = null;
    });
  },

  setColumnLocale(colId, loc) {
    if (WALL_CONFIG.locales.includes(loc)) {
      this.columnLocales[colId] = loc;
    }
  },

  getColumnLocale(colId) {
    return this.columnLocales[colId] || 'id';
  },

  setLocale(loc) {
    if (WALL_CONFIG.locales.includes(loc)) {
      WALL_CONFIG.columns.forEach(col => {
        this.columnLocales[col.id] = loc;
      });
    }
  },

  setColumnState(colId, state) {
    this.columns[colId] = state;
  },

  getColumnState(colId) {
    return this.columns[colId] || 'idle';
  },

  setActiveSubItem(colId, subKey) {
    this.activeSubItem[colId] = subKey;
  },

  getActiveSubItem(colId) {
    return this.activeSubItem[colId] || null;
  },

  hasAnyActive() {
    return Object.values(this.columns).some(s => s === 'active' || s === 'submenu');
  },

  resetColumn(colId) {
    this.columns[colId] = 'idle';
    this.carouselIndex[colId] = 0;
    this.activeSubItem[colId] = null;
  },

  resetAll() {
    WALL_CONFIG.columns.forEach(col => {
      this.columns[col.id] = 'idle';
      this.carouselIndex[col.id] = 0;
      this.activeSubItem[col.id] = null;
    });
  },
};
