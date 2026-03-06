document.addEventListener("DOMContentLoaded", function () {
  const burgerButton = document.querySelector("[data-burger]");
  const menuOverlay = document.querySelector("[data-menu]");
  const closeButton = document.querySelector("[data-menu-close]");

  function openMenu() {
    if (!menuOverlay) return;
    menuOverlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    if (!menuOverlay) return;
    menuOverlay.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  function scrollToSection(hash) {
    const targetSection = document.querySelector(hash);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: "smooth" });
    }
  }

  // Open menu
  if (burgerButton) {
    burgerButton.addEventListener("click", function (event) {
      event.preventDefault();
      openMenu();
    });
  }

  // Close menu
  if (closeButton) {
    closeButton.addEventListener("click", function (event) {
      event.preventDefault();
      closeMenu();
    });
  }

  // Close menu when clicking on a link and scroll to section
  if (menuOverlay) {
    const menuLinks = menuOverlay.querySelectorAll('a[href^="#"]');
    menuLinks.forEach(function (link) {
      link.addEventListener("click", function (event) {
        const targetHash = link.getAttribute("href");
        if (targetHash && targetHash !== "#") {
          event.preventDefault();
          closeMenu();
          scrollToSection(targetHash);
        }
      });
    });

    // Close menu when clicking outside (on overlay background)
    menuOverlay.addEventListener("click", function (event) {
      if (event.target === menuOverlay) {
        closeMenu();
      }
    });
  }

  // Close menu on Escape key
  document.addEventListener("keydown", function (event) {
    if (
      event.key === "Escape" &&
      menuOverlay &&
      menuOverlay.classList.contains("is-open")
    ) {
      closeMenu();
    }
  });
});
