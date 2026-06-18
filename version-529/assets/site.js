(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            var opened = mobileNav.classList.toggle("open");
            menuButton.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var currentSlide = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === currentSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === currentSlide);
        });
    }

    function startSlider() {
        if (slides.length < 2) {
            return;
        }

        timer = window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    function restartSlider() {
        if (timer) {
            window.clearInterval(timer);
        }
        startSlider();
    }

    document.querySelectorAll("[data-hero-next]").forEach(function (button) {
        button.addEventListener("click", function () {
            showSlide(currentSlide + 1);
            restartSlider();
        });
    });

    document.querySelectorAll("[data-hero-prev]").forEach(function (button) {
        button.addEventListener("click", function () {
            showSlide(currentSlide - 1);
            restartSlider();
        });
    });

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showSlide(index);
            restartSlider();
        });
    });

    showSlide(0);
    startSlider();

    document.querySelectorAll(".search-form").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var input = form.querySelector("input");
            var value = input ? input.value.trim() : "";
            var params = new URLSearchParams();
            if (value) {
                params.set("q", value);
            }
            window.location.href = "./search.html" + (params.toString() ? "?" + params.toString() : "");
        });
    });

    var filterForms = Array.prototype.slice.call(document.querySelectorAll(".filter-bar"));

    function applyFilter(form) {
        var root = form.closest(".filter-shell") || document;
        var wrap = root.parentElement || document;
        var cards = Array.prototype.slice.call(wrap.querySelectorAll(".movie-card"));
        var keyword = (form.querySelector("[data-filter-keyword]") || {}).value || "";
        var region = (form.querySelector("[data-filter-region]") || {}).value || "";
        var type = (form.querySelector("[data-filter-type]") || {}).value || "";
        var lowered = keyword.trim().toLowerCase();
        var visible = 0;

        cards.forEach(function (card) {
            var text = (card.getAttribute("data-search") || "").toLowerCase();
            var cardRegion = card.getAttribute("data-region") || "";
            var cardType = card.getAttribute("data-type") || "";
            var matched = true;

            if (lowered && text.indexOf(lowered) === -1) {
                matched = false;
            }
            if (region && cardRegion !== region) {
                matched = false;
            }
            if (type && cardType !== type) {
                matched = false;
            }

            card.style.display = matched ? "" : "none";
            if (matched) {
                visible += 1;
            }
        });

        var empty = wrap.querySelector(".no-results");
        if (empty) {
            empty.style.display = visible ? "none" : "block";
        }
    }

    filterForms.forEach(function (form) {
        var params = new URLSearchParams(window.location.search);
        var input = form.querySelector("[data-filter-keyword]");
        if (input && params.get("q")) {
            input.value = params.get("q");
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            applyFilter(form);
        });

        form.querySelectorAll("input, select").forEach(function (field) {
            field.addEventListener("input", function () {
                applyFilter(form);
            });
            field.addEventListener("change", function () {
                applyFilter(form);
            });
        });

        applyFilter(form);
    });
})();
