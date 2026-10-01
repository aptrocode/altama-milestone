/* ==========================================================================
   ALTAMA Interactive Wall — Application State Store
   ========================================================================== */

const WallState = {
  // Status masing-masing kolom ('idle' | 'submenu' | 'active')
  columnStates: {},

  // Sub-item aktif untuk kolom tipe expandable (contoh: col 2 -> 'tekiro')
  activeSubItem: {},

  // Index slide carousel aktif per kolom
  carouselIndex: {},

  // Event listeners
  _listeners: [],

  /** Initialize state from COLUMNS_DATA */
  init() {
    COLUMNS_DATA.forEach(col => {
      this.columnStates[col.id] = 'idle';
      this.carouselIndex[col.id] = 0;
      if (col.type === 'expandable' && col.defaultSub) {
        this.activeSubItem[col.id] = col.defaultSub;
      }
    });
    this.notify('init');
  },

  /** Get state of a specific column ('idle' | 'submenu' | 'active') */
  getColumnState(colId) {
    return this.columnStates[colId] || 'idle';
  },

  /** Set state of a specific column */
  setColumnState(colId, state) {
    this.columnStates[colId] = state;
    this.notify('columnStateChange', { colId, state });
  },

  /** Get active sub-item key for an expandable column */
  getActiveSubItem(colId) {
    return this.activeSubItem[colId] || '';
  },

  /** Set active sub-item key for an expandable column */
  setActiveSubItem(colId, subKey) {
    this.activeSubItem[colId] = subKey;
    this.carouselIndex[colId] = 0; // reset carousel saat sub-menu berganti
    this.notify('subItemChange', { colId, subKey });
  },

  /** Get active slides array for a column or its active sub-item */
  getActiveSlides(colId) {
    const col = COLUMNS_DATA.find(c => c.id === colId);
    if (!col) return [];

    if (col.type === 'expandable') {
      const activeKey = this.getActiveSubItem(colId);
      const sub = col.subItems?.find(s => s.key === activeKey);
      if (sub && sub.slides) return sub.slides;
    }

    return col.slides || [];
  },

  /** Get carousel index for a column */
  getCarouselIndex(colId) {
    return this.carouselIndex[colId] || 0;
  },

  /** Set carousel index for a column */
  setCarouselIndex(colId, index) {
    this.carouselIndex[colId] = index;
    this.notify('carouselChange', { colId, index });
  },

  /** Check if any column is currently in active state */
  hasAnyActive() {
    return Object.values(this.columnStates).some(s => s === 'active');
  },

  /** Reset all columns to idle state */
  resetAll() {
    COLUMNS_DATA.forEach(col => {
      this.columnStates[col.id] = 'idle';
      this.carouselIndex[col.id] = 0;
      if (col.defaultSub) {
        this.activeSubItem[col.id] = col.defaultSub;
      }
    });
    this.notify('resetAll');
  },

  /** Subscribe to state changes */
  subscribe(fn) {
    this._listeners.push(fn);
  },

  /** Notify all subscribers */
  notify(event, data) {
    this._listeners.forEach(fn => {
      try { fn(event, data); } catch (e) { console.error(e); }
    });
  },
};
