(() => {
  "use strict";

  function normalizeText(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim()
      .toLocaleLowerCase("tr-TR");
  }

  function decorateWhatsappButtons() {
    document
      .querySelectorAll(
        'a, button, input[type="submit"]'
      )
      .forEach((element) => {
        const text = normalizeText(
          element.textContent ||
          element.value ||
          element.getAttribute("aria-label")
        );

        const href = String(
          element.getAttribute("href") || ""
        ).toLowerCase();

        if (
          text.includes("whatsapp") ||
          href.includes("wa.me") ||
          href.includes("whatsapp")
        ) {
          element.classList.add(
            "asel-whatsapp-button"
          );
        }
      });
  }

  function improveEmptyPrice() {
    const price = document.querySelector(
      "#priceValue, .price-value, .estimated-price"
    );

    if (!price) return;

    const update = () => {
      const value = normalizeText(price.textContent);

      const isEmpty =
        value === "€0" ||
        value === "€0,00" ||
        value === "€0.00" ||
        value === "0 €" ||
        value === "0";

      if (isEmpty) {
        price.textContent = "Henüz hesaplanmadı";
        price.classList.add("is-empty-price");
      } else {
        price.classList.remove("is-empty-price");
      }
    };

    update();

    const observer = new MutationObserver(update);

    observer.observe(price, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }

  function enhanceExternalLinks() {
    document
      .querySelectorAll('a[target="_blank"]')
      .forEach((link) => {
        const rel = new Set(
          String(link.rel || "")
            .split(/\s+/)
            .filter(Boolean)
        );

        rel.add("noopener");
        rel.add("noreferrer");

        link.rel = Array.from(rel).join(" ");
      });
  }

  document.addEventListener(
    "DOMContentLoaded",
    () => {
      decorateWhatsappButtons();
      improveEmptyPrice();
      enhanceExternalLinks();
    }
  );
})();
