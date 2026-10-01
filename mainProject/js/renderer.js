/* ==========================================================================
   ALTAMA Interactive Wall — Dynamic DOM Renderer
   ==========================================================================
   Bertanggung jawab me-render dan memperbarui elemen DOM berdasarkan
   data dari `config.js` dan status dari `state.js`.
   ========================================================================== */

const WallRenderer = {
  /**
   * Render SVG placeholder icon string
   */
  getPlaceholderSvg(caption) {
    return `
      <div class="placeholder-img">
        <svg viewBox="0 0 100 80" class="img-icon">
          <polygon points="50,15 85,65 15,65" fill="currentColor"/>
        </svg>
        <span>${caption || 'PLACEHOLDER FOTO'}</span>
      </div>
    `;
  },

  /**
   * Render slide element (Image atau SVG placeholder)
   */
  createSlideElement(slide, index, isActive) {
    const slideDiv = document.createElement('div');
    slideDiv.className = `carousel-slide ${isActive ? 'active' : ''}`;
    slideDiv.dataset.slideIndex = index;

    if (slide.image && slide.image.trim() !== '') {
      const img = document.createElement('img');
      img.className = 'slide-img';
      img.src = slide.image;
      img.alt = slide.caption || `Slide ${index + 1}`;
      // Fallback jika file gambar tidak ditemukan
      img.onerror = () => {
        console.warn(`[WallRenderer] Gagal memuat gambar: ${slide.image}. Menampilkan placeholder.`);
        slideDiv.innerHTML = this.getPlaceholderSvg(slide.caption);
      };
      slideDiv.appendChild(img);
    } else {
      slideDiv.innerHTML = this.getPlaceholderSvg(slide.caption);
    }

    return slideDiv;
  },

  /**
   * Populate carousel slides for a column
   */
  renderColumnCarousel(colId, slides, activeIndex = 0) {
    const container = document.querySelector(`.active-content[data-col="${colId}"] .carousel-viewport`);
    if (!container || !slides) return;

    container.innerHTML = '';
    slides.forEach((slide, i) => {
      const slideEl = this.createSlideElement(slide, i, i === activeIndex);
      container.appendChild(slideEl);
    });

    this.updateIndicator(colId, activeIndex, slides.length);
  },

  /**
   * Update carousel number indicator (e.g. 01 / 03)
   */
  updateIndicator(colId, currentIndex, totalSlides) {
    const indicator = document.querySelector(`.active-content[data-col="${colId}"] .carousel-indicator`);
    if (!indicator) return;

    const currStr = String(currentIndex + 1).padStart(2, '0');
    const totalStr = String(totalSlides).padStart(2, '0');
    indicator.textContent = `${currStr} / ${totalStr}`;
  },

  /**
   * Set active slide class
   */
  setActiveSlide(colId, targetIndex) {
    const container = document.querySelector(`.active-content[data-col="${colId}"] .carousel-viewport`);
    if (!container) return;

    const slides = container.querySelectorAll('.carousel-slide');
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === targetIndex);
    });
  },

  /**
   * Update Zone Top Header
   */
  updateHeader(colId, title, desc) {
    const header = document.querySelector(`.content-header[data-col="${colId}"]`);
    if (!header) return;

    const titleEl = header.querySelector('h2');
    const descEl = header.querySelector('p');

    if (titleEl) titleEl.textContent = title;
    if (descEl) descEl.textContent = desc;
  },

  /**
   * Update Zone Bottom Description
   */
  updateBottomDesc(colId, title, desc) {
    const item = document.querySelector(`.bottom-desc[data-col="${colId}"]`);
    if (!item) return;

    const titleEl = item.querySelector('h4');
    const descEl = item.querySelector('p');

    if (titleEl) titleEl.textContent = title;
    if (descEl) descEl.textContent = desc;
  },

  /**
   * Initialize all carousels on page load from config
   */
  initAllCarousels() {
    COLUMNS_DATA.forEach(col => {
      const slides = WallState.getActiveSlides(col.id);
      const activeIdx = WallState.getCarouselIndex(col.id);
      this.renderColumnCarousel(col.id, slides, activeIdx);
    });
  },
};
