const CONTACT_MODAL_OPEN_CLASS = "modal-contact--open";

function getContactModal() {
  return document.getElementById("modal-contact");
}

function openContactModal(clickEvent) {
  clickEvent.preventDefault();
  const contactModal = getContactModal();
  if (!contactModal) return;
  contactModal.classList.add(CONTACT_MODAL_OPEN_CLASS);
  document.body.style.overflow = "hidden";
}

function closeContactModal(clickEvent) {
  if (clickEvent) clickEvent.preventDefault();
  const contactModal = getContactModal();
  if (!contactModal) return;
  contactModal.classList.remove(CONTACT_MODAL_OPEN_CLASS);
  document.body.style.overflow = "";
}

document.addEventListener("click", (clickEvent) => {
  const openButton = clickEvent.target.closest("[data-contact-open]");
  if (openButton) {
    openContactModal(clickEvent);
    return;
  }

  const closeButton = clickEvent.target.closest("[data-contact-close]");
  if (closeButton) {
    closeContactModal(clickEvent);
    return;
  }

  const contactModal = getContactModal();
  if (contactModal && clickEvent.target === contactModal) {
    closeContactModal(clickEvent);
  }
});

document.addEventListener("keydown", (keyboardEvent) => {
  const contactModal = getContactModal();
  if (
    keyboardEvent.key === "Escape" &&
    contactModal &&
    contactModal.classList.contains(CONTACT_MODAL_OPEN_CLASS)
  ) {
    closeContactModal();
  }
});
