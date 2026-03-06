class ClientsCarousel {
  constructor(carouselSelector = ".carousel-clients") {
    this.carouselSelector = carouselSelector;
    this.carouselElement = null;
    this.trackElement = null;

    /** @type {HTMLElement[]} All card elements inside the track */
    this.cardElements = [];

    /** @type {{ src: string, alt: string }[]} Image data extracted from cards */
    this.cardImages = [];

    /** Index of the first visible card in the carousel */
    this.visibleStartIndex = 0;

    /** How many cards are shown at once (depends on viewport) */
    this.visibleCardCount = 1;

    /* Modal elements */
    this.modalOverlay = null;
    this.modalImage = null;

    /** Index of the currently opened image in the modal */
    this.modalCurrentIndex = 0;
    this.isModalOpen = false;

    this.initialized = false;

    this.init();
  }

  /* ------------------------------------------------------------------ */
  /*  Initialisation                                                     */
  /* ------------------------------------------------------------------ */

  init() {
    this.carouselElement = document.querySelector(this.carouselSelector);

    if (!this.carouselElement) {
      // Retry — HTMX may not have injected the partial yet
      setTimeout(() => this.init(), 500);
      return;
    }

    if (this.initialized) return;
    this.initialized = true;

    this.trackElement = this.carouselElement.querySelector(
      ".carousel-clients__track",
    );
    this.cardElements = Array.from(
      this.carouselElement.querySelectorAll(".carousel-clients__item"),
    );

    // Build an image data array from the DOM
    this.cardImages = this.cardElements.map((card) => {
      const img = card.querySelector("img");
      return {
        src: img ? img.src : "",
        alt: img ? img.alt : "",
      };
    });

    this.calculateVisibleCards();
    this.updateTrackPosition();
    this.attachCarouselControls();
    this.attachCardClickHandlers();
    this.createModalElement();
    this.attachKeyboardNavigation();
    this.attachResizeListener();
  }

  /* ------------------------------------------------------------------ */
  /*  Responsive helpers                                                 */
  /* ------------------------------------------------------------------ */

  /** Determine how many cards should be visible based on viewport width */
  calculateVisibleCards() {
    const viewportWidth = window.innerWidth;

    if (viewportWidth >= 1091) {
      this.visibleCardCount = 4;
    } else if (viewportWidth >= 991) {
      this.visibleCardCount = 2;
    } else {
      this.visibleCardCount = 1;
    }

    // Make sure visibleStartIndex is still valid
    const maxStartIndex = Math.max(
      0,
      this.cardElements.length - this.visibleCardCount,
    );
    if (this.visibleStartIndex > maxStartIndex) {
      this.visibleStartIndex = maxStartIndex;
    }
  }

  /** Recalculate on window resize */
  attachResizeListener() {
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.calculateVisibleCards();
        this.updateTrackPosition();
      }, 150);
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Carousel navigation                                                */
  /* ------------------------------------------------------------------ */

  attachCarouselControls() {
    const prevButton = this.carouselElement.querySelector(
      "[data-carousel-prev]",
    );
    const nextButton = this.carouselElement.querySelector(
      "[data-carousel-next]",
    );

    if (prevButton) {
      prevButton.addEventListener("click", () => this.slideToPrevious());
    }
    if (nextButton) {
      nextButton.addEventListener("click", () => this.slideToNext());
    }
  }

  slideToNext() {
    const maxStartIndex = Math.max(
      0,
      this.cardElements.length - this.visibleCardCount,
    );
    if (this.visibleStartIndex < maxStartIndex) {
      this.visibleStartIndex += 1;
    } else {
      // Loop back to beginning
      this.visibleStartIndex = 0;
    }
    this.updateTrackPosition();
  }

  slideToPrevious() {
    if (this.visibleStartIndex > 0) {
      this.visibleStartIndex -= 1;
    } else {
      // Loop to end
      this.visibleStartIndex = Math.max(
        0,
        this.cardElements.length - this.visibleCardCount,
      );
    }
    this.updateTrackPosition();
  }

  /** Shift the track so the correct cards are in view */
  updateTrackPosition() {
    if (!this.trackElement) return;

    const gapPx = 20; // must match the CSS gap
    const cardWidthPercent = 100 / this.visibleCardCount;

    // Each step = one card width + its share of the gap
    const offsetPercent = -(this.visibleStartIndex * cardWidthPercent);
    const offsetGapPx = -(this.visibleStartIndex * gapPx);

    this.trackElement.style.transform = `translateX(calc(${offsetPercent}% + ${offsetGapPx}px))`;
  }

  /* ------------------------------------------------------------------ */
  /*  Card click → open modal                                            */
  /* ------------------------------------------------------------------ */

  attachCardClickHandlers() {
    this.cardElements.forEach((card, index) => {
      card.style.cursor = "pointer";
      card.addEventListener("click", () => this.openModal(index));
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Modal (lightbox) for single image preview                          */
  /* ------------------------------------------------------------------ */

  createModalElement() {
    if (document.querySelector("[data-clients-modal]")) {
      this.modalOverlay = document.querySelector("[data-clients-modal]");
      this.modalImage = this.modalOverlay.querySelector(
        ".clients-modal__image",
      );
      return;
    }

    const overlay = document.createElement("div");
    overlay.setAttribute("data-clients-modal", "");
    overlay.className = "clients-modal";
    overlay.innerHTML = `
      <div class="clients-modal__backdrop"></div>
      <div class="clients-modal__container">
        <button class="clients-modal__close" aria-label="Close preview">
          <span class="clients-modal__close-icon">✕</span>
        </button>

        <div class="clients-modal__content">
          <img class="clients-modal__image" src="" alt="" />
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.modalOverlay = overlay;
    this.modalImage = overlay.querySelector(".clients-modal__image");

    // Close handlers
    overlay
      .querySelector(".clients-modal__close")
      .addEventListener("click", () => this.closeModal());

    overlay
      .querySelector(".clients-modal__backdrop")
      .addEventListener("click", () => this.closeModal());
  }

  openModal(cardIndex) {
    if (!this.modalOverlay) return;

    this.modalCurrentIndex = cardIndex;
    this.isModalOpen = true;

    this.renderModalImage();

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    this.modalOverlay.classList.add("clients-modal--active");
  }

  closeModal() {
    if (!this.modalOverlay) return;

    this.isModalOpen = false;

    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    this.modalOverlay.classList.remove("clients-modal--active");
  }

  showNextInModal() {
    this.modalCurrentIndex =
      (this.modalCurrentIndex + 1) % this.cardImages.length;
    this.renderModalImage();
  }

  showPreviousInModal() {
    this.modalCurrentIndex =
      (this.modalCurrentIndex - 1 + this.cardImages.length) %
      this.cardImages.length;
    this.renderModalImage();
  }

  renderModalImage() {
    const imageData = this.cardImages[this.modalCurrentIndex];
    if (!imageData || !this.modalImage) return;

    this.modalImage.src = imageData.src;
    this.modalImage.alt = imageData.alt;
  }

  /* ------------------------------------------------------------------ */
  /*  Navigation                                                */
  /* ------------------------------------------------------------------ */

  attachKeyboardNavigation() {
    document.addEventListener("keydown", (event) => this.handleKeyPress(event));
  }

  handleKeyPress(event) {
    if (!this.isModalOpen) return;

    switch (event.key) {
      case "Escape":
        this.closeModal();
        break;
    }
  }
}

let clientsCarouselInstance = null;

function initClientsCarousel() {
  clientsCarouselInstance = new ClientsCarousel();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initClientsCarousel);
} else {
  initClientsCarousel();
}

// Re-init after HTMX swaps new content in
if (window.htmx) {
  htmx.on("htmx:afterSettle", () => {
    initClientsCarousel();
  });
}
