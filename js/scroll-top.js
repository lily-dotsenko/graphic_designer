document.addEventListener("DOMContentLoaded", function () {
  var scrollTopButton = document.createElement("button");
  scrollTopButton.className = "scroll-top";
  scrollTopButton.setAttribute("type", "button");
  scrollTopButton.setAttribute("aria-label", "Scroll to top");

  var scrollTopIcon = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg",
  );
  scrollTopIcon.setAttribute("width", "20");
  scrollTopIcon.setAttribute("height", "20");
  scrollTopIcon.setAttribute("viewBox", "0 0 24 24");
  scrollTopIcon.setAttribute("fill", "none");
  scrollTopIcon.setAttribute("stroke", "currentColor");
  scrollTopIcon.setAttribute("stroke-width", "2.5");
  scrollTopIcon.setAttribute("stroke-linecap", "round");
  scrollTopIcon.setAttribute("stroke-linejoin", "round");

  var arrowPath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path",
  );
  arrowPath.setAttribute("d", "M18 15l-6-6-6 6");

  scrollTopIcon.appendChild(arrowPath);
  scrollTopButton.appendChild(scrollTopIcon);
  document.body.appendChild(scrollTopButton);

  var scrollThreshold = 400;

  function toggleScrollTopButton() {
    var scrollPosition = window.scrollY || document.documentElement.scrollTop;

    if (scrollPosition > scrollThreshold) {
      scrollTopButton.classList.add("is-visible");
    } else {
      scrollTopButton.classList.remove("is-visible");
    }
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  scrollTopButton.addEventListener("click", scrollToTop);
  window.addEventListener("scroll", toggleScrollTopButton);
});
