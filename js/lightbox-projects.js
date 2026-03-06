class ProjectsLightbox {
  constructor(gallerySelector = "[data-projects-gallery]") {
    this.gallerySelector = gallerySelector;
    this.gallery = null;
    this.currentIndex = 0;
    this.projects = [];
    this.lightboxElement = null;
    this.isOpen = false;
    this.initialized = false;
    this.clickHandler = null;
    this.isZoomed = false;
    this.zoomLevel = 1;

    this.init();
  }

  /**
   * Initialize the lightbox
   * Extract project links and attach event listeners
   */
  init() {
    this.gallery = document.querySelector(this.gallerySelector);

    if (!this.gallery) {
      // Retry after a delay in case HTMX hasn't loaded the partial yet
      setTimeout(() => this.init(), 500);
      return;
    }

    if (this.initialized) return;
    this.initialized = true;

    // Get all project links with data-project-open attribute
    this.projects = Array.from(
      this.gallery.querySelectorAll("[data-project-open]"),
    );

    if (this.projects.length === 0) {
      return;
    }

    console.log("Found", this.projects.length, "projects in gallery");

    // Remove old listener if it exists
    if (this.clickHandler) {
      this.gallery.removeEventListener("click", this.clickHandler);
    }

    // Bind click handler to preserve 'this' context
    this.clickHandler = (event) => this.handleGalleryClick(event);

    // Use event delegation on the gallery
    this.gallery.addEventListener("click", this.clickHandler);

    // Create lightbox HTML structure
    this.createLightboxElement();

    // Attach keyboard listeners
    document.addEventListener("keydown", (event) => this.handleKeyboard(event));
  }

  /**
   * Handle clicks on project images
   */
  handleGalleryClick(event) {
    const projectLink = event.target.closest("[data-project-open]");

    if (!projectLink) return;

    event.preventDefault();
    event.stopPropagation();

    // Find the index of the clicked project
    this.currentIndex = this.projects.indexOf(projectLink);

    // Open the lightbox
    this.open();
  }

  /**
   * Create the lightbox HTML structure
   */
  createLightboxElement() {
    // Check if lightbox already exists
    if (document.querySelector("[data-lightbox-projects]")) {
      this.lightboxElement = document.querySelector("[data-lightbox-projects]");
      return;
    }

    const lightbox = document.createElement("div");
    lightbox.setAttribute("data-lightbox-projects", "");
    lightbox.className = "lightbox-projects";
    lightbox.innerHTML = `
      <div class="lightbox-projects__backdrop"></div>
      <div class="lightbox-projects__container">
        <button class="lightbox-projects__close" aria-label="Close lightbox">
          <span class="lightbox-projects__close-icon">✕</span>
        </button>
        
        <button class="lightbox-projects__zoom" aria-label="Zoom in/out">
          <span class="lightbox-projects__zoom-icon">🔍</span>
        </button>
        
        <button class="lightbox-projects__nav lightbox-projects__nav--prev" aria-label="Previous image">
          <span class="lightbox-projects__nav-icon">‹</span>
        </button>

        <div class="lightbox-projects__content">
          <img class="lightbox-projects__image" src="" alt="Project image" />
        </div>

        <button class="lightbox-projects__nav lightbox-projects__nav--next" aria-label="Next image">
          <span class="lightbox-projects__nav-icon">›</span>
        </button>
      </div>
    `;

    // Append to body
    document.body.appendChild(lightbox);

    // Cache the lightbox element
    this.lightboxElement = lightbox;

    // Attach event listeners to lightbox controls
    this.lightboxElement
      .querySelector(".lightbox-projects__close")
      .addEventListener("click", () => this.close());

    this.lightboxElement
      .querySelector(".lightbox-projects__backdrop")
      .addEventListener("click", () => this.close());

    this.lightboxElement
      .querySelector(".lightbox-projects__nav--prev")
      .addEventListener("click", () => this.previous());

    this.lightboxElement
      .querySelector(".lightbox-projects__nav--next")
      .addEventListener("click", () => this.next());

    this.lightboxElement
      .querySelector(".lightbox-projects__zoom")
      .addEventListener("click", () => this.toggleZoom());
  }

  /**
   * Open the lightbox and display the current image
   */
  open() {
    if (!this.lightboxElement) return;

    this.isOpen = true;

    // Prevent body scroll
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    // Display lightbox
    this.lightboxElement.classList.add("lightbox-projects--active");

    // Update image and counter
    this.updateImage();
  }

  /**
   * Close the lightbox
   */
  close() {
    if (!this.lightboxElement) return;

    this.isOpen = false;

    // Restore body scroll
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";

    // Hide lightbox
    this.lightboxElement.classList.remove("lightbox-projects--active");
  }

  /**
   * Show the next image
   */
  next() {
    this.currentIndex = (this.currentIndex + 1) % this.projects.length;
    this.updateImage();
  }

  /**
   * Show the previous image
   */
  previous() {
    this.currentIndex =
      (this.currentIndex - 1 + this.projects.length) % this.projects.length;
    this.updateImage();
  }

  /**
   * Update the displayed image and counter
   */
  updateImage() {
    const currentProject = this.projects[this.currentIndex];
    const img = currentProject.querySelector(".latest-projects__image");

    if (!img) return;

    const imgElement = this.lightboxElement.querySelector(
      ".lightbox-projects__image",
    );
    imgElement.src = img.src;
    imgElement.alt = img.alt;

    // Reset zoom when changing images
    if (this.isZoomed) {
      this.isZoomed = false;
      this.zoomLevel = 1;
      imgElement.style.transform = "scale(1)";
    }
  }

  /**
   * Toggle zoom on image
   */
  toggleZoom() {
    const imgElement = this.lightboxElement.querySelector(
      ".lightbox-projects__image",
    );

    if (this.isZoomed) {
      // Zoom out
      this.zoomLevel = 1;
      this.isZoomed = false;
      imgElement.style.transform = "scale(1)";
    } else {
      // Zoom in
      this.zoomLevel = 2;
      this.isZoomed = true;
      imgElement.style.transform = "scale(2)";
    }
  }

  /**
   * Handle keyboard navigation
   */
  handleKeyboard(event) {
    if (!this.isOpen) return;

    switch (event.key) {
      case "Escape":
        this.close();
        break;
      case "ArrowLeft":
        event.preventDefault();
        this.previous();
        break;
      case "ArrowRight":
        event.preventDefault();
        this.next();
        break;
    }
  }
}

// Global instance for reinitializing
let lightboxInstance = null;

// Initialize lightbox when DOM is ready
function initLightbox() {
  lightboxInstance = new ProjectsLightbox();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLightbox);
} else {
  initLightbox();
}

// Support HTMX - reinitialize when content is swapped
if (window.htmx) {
  htmx.on("htmx:afterSettle", () => {
    initLightbox();
  });
}
