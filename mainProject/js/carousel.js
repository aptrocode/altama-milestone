/* ==========================================================================
   ALTAMA Interactive Wall — Carousel Engine (Sensor Ready)
   ========================================================================== */

const Carousel = {
  goTo(colId, index) {
    const carousel = document.querySelector(`.carousel[data-col="${colId}"]`);
    if (!carousel) return;

    const slides = carousel.querySelectorAll('.carousel-slide');
    const total = slides.length;
    if (total === 0) return;

    let target = index;
    if (target < 0) target = total - 1;
    if (target >= total) target = 0;

    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === target);
    });

    WallState.carouselIndex[colId] = target;

    const indicator = carousel.querySelector('.carousel-indicator');
    if (indicator) {
      const curStr = String(target + 1).padStart(2, '0');
      const totStr = String(total).padStart(2, '0');
      indicator.textContent = `${curStr} / ${totStr}`;
    }

    if (window.ColumnTimer) {
      window.ColumnTimer.reset(colId);
    }
  },

  next(colId) {
    const current = WallState.carouselIndex[colId] || 0;
    this.goTo(colId, current + 1);
  },

  prev(colId) {
    const current = WallState.carouselIndex[colId] || 0;
    this.goTo(colId, current - 1);
  },
};
