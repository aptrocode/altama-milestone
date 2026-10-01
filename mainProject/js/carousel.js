/* ==========================================================================
   ALTAMA Interactive Wall — Carousel Controller
   ========================================================================== */

const CarouselController = {
  /**
   * Navigate to next (+1) or previous (-1) slide in a column's carousel.
   */
  navigate(colId, direction) {
    const slides = WallState.getActiveSlides(colId);
    const totalSlides = slides.length;
    if (totalSlides === 0) return;

    let currentIndex = WallState.getCarouselIndex(colId);
    currentIndex += direction;

    // Wrap around
    if (currentIndex >= totalSlides) currentIndex = 0;
    if (currentIndex < 0) currentIndex = totalSlides - 1;

    WallState.setCarouselIndex(colId, currentIndex);
    WallRenderer.setActiveSlide(colId, currentIndex);
    WallRenderer.updateIndicator(colId, currentIndex, totalSlides);
  },

  /**
   * Reset carousel for a column (e.g. when opening a new category or sub-menu).
   */
  reset(colId) {
    const slides = WallState.getActiveSlides(colId);
    WallState.setCarouselIndex(colId, 0);
    WallRenderer.renderColumnCarousel(colId, slides, 0);
  },

  /**
   * Bind 1-second hold-to-activate events on navigation arrows.
   */
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
