(function () {
  var menuToggle = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    if (slides.length > 0) {
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
          startTimer();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(current - 1);
          startTimer();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          showSlide(current + 1);
          startTimer();
        });
      }

      startTimer();
    }
  }

  var scope = document.querySelector("[data-filter-scope]");

  if (scope) {
    var input = scope.querySelector("[data-filter-input]");
    var year = scope.querySelector("[data-filter-year]");
    var region = scope.querySelector("[data-filter-region]");
    var type = scope.querySelector("[data-filter-type]");
    var sort = scope.querySelector("[data-filter-sort]");
    var list = document.querySelector("[data-card-list]");
    var empty = document.querySelector("[data-empty-state]");
    var cards = list ? Array.prototype.slice.call(list.querySelectorAll("[data-card]")) : [];
    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get("q");

    if (input && queryValue) {
      input.value = queryValue;
    }

    function cardText(card) {
      return [
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags
      ].join(" ").toLowerCase();
    }

    function applyFilters() {
      var q = input ? input.value.trim().toLowerCase() : "";
      var selectedYear = year ? year.value : "";
      var selectedRegion = region ? region.value : "";
      var selectedType = type ? type.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var matched = true;

        if (q && cardText(card).indexOf(q) === -1) {
          matched = false;
        }

        if (selectedYear && card.dataset.year !== selectedYear) {
          matched = false;
        }

        if (selectedRegion && card.dataset.region !== selectedRegion) {
          matched = false;
        }

        if (selectedType && card.dataset.type !== selectedType) {
          matched = false;
        }

        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    function applySort() {
      if (!list || !sort) {
        applyFilters();
        return;
      }

      var mode = sort.value;
      var sorted = cards.slice();

      if (mode === "score") {
        sorted.sort(function (a, b) {
          return Number(b.dataset.score || 0) - Number(a.dataset.score || 0);
        });
      }

      if (mode === "year") {
        sorted.sort(function (a, b) {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        });
      }

      sorted.forEach(function (card) {
        list.appendChild(card);
      });

      applyFilters();
    }

    [input, year, region, type].forEach(function (node) {
      if (node) {
        node.addEventListener("input", applyFilters);
        node.addEventListener("change", applyFilters);
      }
    });

    if (sort) {
      sort.addEventListener("change", applySort);
    }

    applySort();
  }
}());
