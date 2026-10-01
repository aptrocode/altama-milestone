/* ============================================
   ALTAMA Interactive Wall — Carousel Controller
   ============================================ */

const CarouselController = {
  /**
   * Navigate to a specific slide index within a column's carousel.
   * @param {number} colId - Column ID (1-6)
   * @param {number} direction - +1 for next, -1 for previous
   */
  navigate(colId, direction) {
    const carousel = document.querySelector(`.active-content[data-col="${colId}"] .carousel`);
    if (!carousel) return;

    const slides = carousel.querySelectorAll('.carousel-slide');
    const totalSlides = slides.length;
    if (totalSlides === 0) return;

    // Update index
    let currentIndex = WallState.carouselIndex[colId] || 0;
    currentIndex += direction;

    // Wrap around
    if (currentIndex >= totalSlides) currentIndex = 0;
    if (currentIndex < 0) currentIndex = totalSlides - 1;

    WallState.carouselIndex[colId] = currentIndex;

    // Update slides
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentIndex);
    });

    // Update indicator
    const indicator = carousel.querySelector('.carousel-indicator');
    if (indicator) {
      indicator.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(totalSlides).padStart(2, '0')}`;
    }
  },

  /** Reset carousel to first slide */
  reset(colId) {
    WallState.carouselIndex[colId] = 0;
    const carousel = document.querySelector(`.active-content[data-col="${colId}"] .carousel`);
    if (!carousel) return;

    const slides = carousel.querySelectorAll('.carousel-slide');
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === 0);
    });

    const indicator = carousel.querySelector('.carousel-indicator');
    if (indicator) {
      const totalSlides = slides.length;
      indicator.textContent = `01 / ${String(totalSlides).padStart(2, '0')}`;
    }
  },

  /** Bind events for a specific carousel */
  bindEvents(colId) {
    const container = document.querySelector(`.active-content[data-col="${colId}"]`);
    if (!container) return;

    const prevBtn = container.querySelector('.carousel-prev');
    const nextBtn = container.querySelector('.carousel-next');

    if (prevBtn) {
      if (window.attachHoldToActivate) {
        window.attachHoldToActivate(prevBtn, () => {
          this.navigate(colId, -1);
        });
      } else {
        prevBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.navigate(colId, -1);
        });
      }
    }

    if (nextBtn) {
      if (window.attachHoldToActivate) {
        window.attachHoldToActivate(nextBtn, () => {
          this.navigate(colId, 1);
        });
      } else {
        nextBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.navigate(colId, 1);
        });
      }
    }
  },
};
