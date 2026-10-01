/* ============================================
   ALTAMA Interactive Wall — State Manager
   ============================================
   Manages the current state of each column
   and the overall wall display mode.
   ============================================ */

const WallState = {
  /*
   * Possible column states:
   *   'idle'      → showing main button
   *   'submenu'   → showing sub-menu buttons (for expandable columns)
   *   'active'    → showing carousel + content
   */
  columns: {},  // { 1: 'idle', 2: 'submenu', ... }

  // Track which sub-item is active for expandable columns
  activeSubItem: {},  // { 2: 'tekiro', 5: 'brand-activation' }

  // Track carousel positions
  carouselIndex: {},  // { 1: 0, 2: 0, ... }

  init() {
    WALL_CONFIG.columns.forEach(col => {
      this.columns[col.id] = 'idle';
      this.carouselIndex[col.id] = 0;
      if (col.type === 'expandable' && col.defaultSub) {
        this.activeSubItem[col.id] = col.defaultSub;
      }
    });
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

  /** Check if any column is in 'active' state */
  hasAnyActive() {
    return Object.values(this.columns).some(s => s === 'active');
  },

  /** Check if all columns are in 'active' state */
  allActive() {
    return Object.values(this.columns).every(s => s === 'active');
  },

  /** Count how many columns are active */
  activeCount() {
    return Object.values(this.columns).filter(s => s === 'active').length;
  },

  /** Reset a single column to idle */
  resetColumn(colId) {
    this.columns[colId] = 'idle';
    this.carouselIndex[colId] = 0;
  },

  /** Reset all columns to idle */
  resetAll() {
    Object.keys(this.columns).forEach(id => {
      this.columns[id] = 'idle';
      this.carouselIndex[id] = 0;
    });
  },
};
