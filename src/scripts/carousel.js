/*
  Carousel functionality for horizontal scrolling containers.

  This script provides a full-featured carousel implementation that matches
  modern web standards and user expectations, similar to what's found on
  platforms like Spotify.

  Features:
  - Smooth scrolling via navigation buttons for a fluid user experience.
  - Arrow navigation buttons dynamically appear on hover and are hidden by default.
  - Buttons automatically hide when the scroll reaches the start or end, preventing user confusion.
  - Full mouse drag-to-scroll support with a "grabbing" cursor for intuitive interaction.
  - Touch/swipe support for a native-like experience on mobile devices.
  - A11y: Keyboard navigation support (Left/Right arrow keys) when the carousel is focused.
  - Performance-optimized with throttled scroll handlers to prevent jank.
  - Resilient to dynamic content loading by using a MutationObserver to update its state.

  Usage:
  This script is self-initializing. It looks for all elements with the
  `data-shelf="carousel"` attribute upon DOMContentLoaded.

  Expected HTML Structure:
  The script assumes the following DOM structure within each `[data-shelf="carousel"]` element:
  - A scrollable container with `data-testid="carousel-scroller"`.
  - A 'previous' button with `data-testid="previous-button"`.
  - A 'next' button with `data-testid="next-button"`.
*/

(function() {
  'use strict';

  /**
   * Throttles a function to limit its execution rate.
   * @param {Function} func The function to throttle.
   * @param {number} limit The minimum time in ms between executions.
   * @returns {Function} The throttled function.
   */
  function throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Sets up a single carousel instance, adding all event listeners and functionality.
   * @param {HTMLElement} carouselElement The main container element for the carousel.
   */
  function setupCarousel(carouselElement) {
    const scroller = carouselElement.querySelector('[data-testid="carousel-scroller"]');
    const prevButton = carouselElement.querySelector('[data-testid="previous-button"]');
    const nextButton = carouselElement.querySelector('[data-testid="next-button"]');

    // If essential elements are not found, abort initialization for this carousel.
    if (!scroller || !prevButton || !nextButton) {
      console.warn('Carousel initialization skipped: required elements not found.', carouselElement);
      return;
    }

    let isDragging = false;
    let startX;
    let scrollLeftStart;

    /**
     * Updates the visibility and state of the navigation buttons based on scroll position.
     */
    function updateNavButtonsState() {
      // A small epsilon is used to handle floating-point inaccuracies in scroll measurements.
      const scrollEpsilon = 1;
      const { scrollLeft, scrollWidth, clientWidth } = scroller;
      const isAtStart = scrollLeft <= scrollEpsilon;
      const isAtEnd = scrollLeft >= scrollWidth - clientWidth - scrollEpsilon;

      // Buttons are only visible when the user is actively hovering over the carousel.
      if (carouselElement.matches(':hover')) {
        prevButton.style.opacity = isAtStart ? '0' : '1';
        prevButton.style.pointerEvents = isAtStart ? 'none' : 'auto';
        nextButton.style.opacity = isAtEnd ? '0' : '1';
        nextButton.style.pointerEvents = isAtEnd ? 'none' : 'auto';
      }
    }

    const throttledUpdate = throttle(updateNavButtonsState, 150);

    // --- Arrow Button Navigation ---

    function scrollByAmount(direction) {
      // Scroll by 80% of the visible width for a pleasant "paging" effect.
      const scrollAmount = scroller.clientWidth * 0.8;
      scroller.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    }

    prevButton.addEventListener('click', () => scrollByAmount(-1));
    nextButton.addEventListener('click', () => scrollByAmount(1));

    // --- Hover State Management ---

    carouselElement.addEventListener('mouseenter', updateNavButtonsState);
    carouselElement.addEventListener('mouseleave', () => {
      prevButton.style.opacity = '0';
      nextButton.style.opacity = '0';
    });

    // --- Scroll & Drag Handling ---

    scroller.addEventListener('scroll', throttledUpdate, { passive: true });

    function handleDragStart(e) {
      isDragging = true;
      scroller.style.cursor = 'grabbing';
      scroller.style.userSelect = 'none';
      scroller.style.scrollBehavior = 'auto'; // Use instant scrolling during drag.

      startX = (e.pageX ?? e.touches[0].pageX) - scroller.offsetLeft;
      scrollLeftStart = scroller.scrollLeft;

      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('touchmove', handleDragMove, { passive: false });
      document.addEventListener('touchend', handleDragEnd);
    }

    function handleDragMove(e) {
      if (!isDragging) return;
      if (e.type === 'touchmove') e.preventDefault(); // Prevent vertical page scroll.

      const x = (e.pageX ?? e.touches[0].pageX) - scroller.offsetLeft;
      const walk = x - startX;
      scroller.scrollLeft = scrollLeftStart - walk;
    }

    function handleDragEnd() {
      if (!isDragging) return;
      isDragging = false;
      scroller.style.cursor = 'grab';
      scroller.style.removeProperty('user-select');
      scroller.style.scrollBehavior = 'smooth'; // Restore smooth scrolling.

      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('touchend', handleDragEnd);
    }

    scroller.addEventListener('mousedown', handleDragStart);
    scroller.addEventListener('touchstart', handleDragStart, { passive: true });

    // --- Keyboard Navigation ---

    scroller.setAttribute('tabindex', '0');
    scroller.style.outline = 'none'; // Remove default focus outline.

    scroller.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollByAmount(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        scrollByAmount(1);
      }
    });

    // --- Dynamic Content Handling ---

    // Observe changes in the scroller content to update button states,
    // e.g., when items are lazy-loaded.
    const observer = new MutationObserver(throttledUpdate);
    observer.observe(scroller, { childList: true, subtree: true });

    // --- Initial State ---

    // Buttons start completely hidden.
    prevButton.style.opacity = '0';
    nextButton.style.opacity = '0';
    prevButton.style.pointerEvents = 'none';
    nextButton.style.pointerEvents = 'none';

    // Set initial styles for interactivity.
    scroller.style.cursor = 'grab';
    scroller.style.scrollBehavior = 'smooth';

    // Run an initial check in case the carousel is not scrolled to the start.
    updateNavButtonsState();
  }

  /**
   * Finds and initializes all carousels on the page.
   */
  function initAllCarousels() {
    const carouselElements = document.querySelectorAll('[data-shelf="carousel"]');
    carouselElements.forEach(setupCarousel);
  }

  // Run initialization once the DOM is fully loaded.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllCarousels);
  } else {
    initAllCarousels();
  }

})();