// Hibeez-Best Handyman - shared site behaviour
(function () {
  "use strict";

  var WHATSAPP_NUMBER = "447884420606"; // +44 7884 420606, international format, no leading +

  /* ---------- Sticky header shrink shadow ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.querySelector(".nav-toggle");
  var mobilePanel = document.querySelector(".mobile-panel");
  if (navToggle && mobilePanel) {
    navToggle.addEventListener("click", function () {
      var isOpen = mobilePanel.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      document.body.style.overflow = isOpen ? "hidden" : "";
    });
    mobilePanel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobilePanel.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
      );
      revealEls.forEach(function (el, i) {
        if (!el.style.getPropertyValue("--i")) {
          el.style.setProperty("--i", i % 6);
        }
        io.observe(el);
      });
    } else {
      revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    }
  }

  /* ---------- Before / after compare sliders ---------- */
  document.querySelectorAll(".compare").forEach(function (compare) {
    var range = compare.querySelector(".compare-range");
    var beforeWrap = compare.querySelector(".compare-before-wrap");
    var handle = compare.querySelector(".compare-handle");
    var beforeImg = compare.querySelector(".compare-before-wrap img");
    if (!range || !beforeWrap || !handle) return;

    function setImgWidth() {
      var w = compare.getBoundingClientRect().width;
      if (beforeImg) beforeImg.style.width = w + "px";
    }

    function update(value) {
      beforeWrap.style.width = value + "%";
      handle.style.left = value + "%";
    }

    setImgWidth();
    update(range.value);
    window.addEventListener("resize", setImgWidth);

    range.addEventListener("input", function () {
      update(range.value);
    });
  });

  /* ---------- Quote form -> WhatsApp ---------- */
  var quoteForm = document.querySelector("#quote-form");
  if (quoteForm) {
    quoteForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = (quoteForm.querySelector("#qf-name") || {}).value || "";
      var phone = (quoteForm.querySelector("#qf-phone") || {}).value || "";
      var area = (quoteForm.querySelector("#qf-area") || {}).value || "";
      var details = (quoteForm.querySelector("#qf-details") || {}).value || "";
      var services = Array.prototype.slice
        .call(quoteForm.querySelectorAll('input[name="service"]:checked'))
        .map(function (el) { return el.value; });

      var lines = [
        "Hi Hibeez-Best Handyman, I'd like a free quote.",
        "",
        "Name: " + (name || "-"),
        "Phone: " + (phone || "-"),
        "Area/Postcode: " + (area || "-"),
        "Service(s): " + (services.length ? services.join(", ") : "-"),
        "",
        "Job details: " + (details || "-"),
      ];

      var message = encodeURIComponent(lines.join("\n"));
      var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + message;
      window.open(url, "_blank", "noopener");
    });
  }

  /* ---------- Simple one-field service inquiry buttons (service pages) ---------- */
  document.querySelectorAll("[data-wa-service]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      var service = btn.getAttribute("data-wa-service");
      var lines = [
        "Hi Hibeez-Best Handyman, I'd like a free quote for " + service + ".",
        "",
        "Name: ",
        "Postcode/Area: ",
        "Job details: ",
      ];
      var message = encodeURIComponent(lines.join("\n"));
      var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + message;
      btn.setAttribute("href", url);
    });
  });

  /* ---------- Footer year ---------- */
  var yearEl = document.querySelector("#current-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
