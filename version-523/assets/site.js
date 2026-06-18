(function () {
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".menu-toggle");

  if (header && toggle) {
    toggle.addEventListener("click", function () {
      header.classList.toggle("mobile-open");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var current = 0;

    function showHero(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    if (slides.length > 1) {
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          showHero(dotIndex);
        });
      });

      window.setInterval(function () {
        showHero(current + 1);
      }, 5000);
    }
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-filter-area]")).forEach(function (area) {
    var input = area.querySelector("[data-filter-input]");
    var year = area.querySelector("[data-filter-year]");
    var genre = area.querySelector("[data-filter-genre]");
    var cards = Array.prototype.slice.call(area.querySelectorAll(".movie-card"));

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var yearValue = year ? year.value : "";
      var genreValue = genre ? genre.value : "";

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-genre") || "",
          card.getAttribute("data-tags") || ""
        ].join(" ").toLowerCase();
        var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var okYear = !yearValue || (card.getAttribute("data-year") || "") === yearValue;
        var okGenre = !genreValue || (card.getAttribute("data-genre") || "").indexOf(genreValue) !== -1;
        card.classList.toggle("hidden-card", !(okKeyword && okYear && okGenre));
      });
    }

    [input, year, genre].forEach(function (el) {
      if (el) {
        el.addEventListener("input", applyFilter);
        el.addEventListener("change", applyFilter);
      }
    });
  });
})();
