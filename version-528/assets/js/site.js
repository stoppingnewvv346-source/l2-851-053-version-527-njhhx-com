(function () {
  "use strict";

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initNavigation() {
    var button = qs(".mobile-menu-button");
    var nav = qs(".mobile-nav");

    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(isOpen));
    });
  }

  function initHero() {
    var carousel = qs(".js-hero-carousel");

    if (!carousel) {
      return;
    }

    var slides = qsa(".hero-slide", carousel);
    var dots = qsa(".hero-dot", carousel);
    var previous = qs(".js-hero-prev", carousel);
    var next = qs(".js-hero-next", carousel);
    var index = 0;
    var timer = null;

    if (!slides.length) {
      return;
    }

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (previous) {
      previous.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide") || 0));
        restart();
      });
    });

    show(0);
    restart();
  }

  function initFilters() {
    var panels = qsa(".filter-panel");

    panels.forEach(function (panel) {
      var scope = panel.nextElementSibling;
      var search = qs(".js-movie-search", panel);
      var region = qs(".js-filter-region", panel);
      var type = qs(".js-filter-type", panel);
      var year = qs(".js-filter-year", panel);
      var reset = qs(".js-reset-filters", panel);
      var count = qs(".js-result-count", panel);

      if (!scope || !scope.classList.contains("js-filter-scope")) {
        scope = qs(".js-filter-scope");
      }

      if (!scope) {
        return;
      }

      var cards = qsa(".movie-card", scope);

      function apply() {
        var keyword = search ? search.value.trim().toLowerCase() : "";
        var regionValue = region ? region.value : "";
        var typeValue = type ? type.value : "";
        var yearValue = year ? year.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-search") || "").toLowerCase();
          var matched = true;

          if (keyword && haystack.indexOf(keyword) === -1) {
            matched = false;
          }

          if (regionValue && card.getAttribute("data-region") !== regionValue) {
            matched = false;
          }

          if (typeValue && card.getAttribute("data-type") !== typeValue) {
            matched = false;
          }

          if (yearValue && card.getAttribute("data-year") !== yearValue) {
            matched = false;
          }

          card.classList.toggle("is-hidden-by-filter", !matched);

          if (matched) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = String(visible);
        }
      }

      [search, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      if (reset) {
        reset.addEventListener("click", function () {
          if (search) {
            search.value = "";
          }

          [region, type, year].forEach(function (control) {
            if (control) {
              control.value = "";
            }
          });

          apply();
        });
      }

      apply();
    });
  }

  function initPlayer(videoId, sourceUrl, posterUrl) {
    var video = document.getElementById(videoId);

    if (!video || !sourceUrl) {
      return;
    }

    var shell = video.closest(".player-shell");
    var overlay = shell ? qs(".play-overlay", shell) : null;
    var hlsInstance = null;
    var isBound = false;

    if (posterUrl) {
      video.setAttribute("poster", posterUrl);
    }

    function bindSource() {
      if (isBound) {
        return;
      }

      isBound = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });

        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
        return;
      }

      video.src = sourceUrl;
    }

    function play() {
      bindSource();

      if (shell) {
        shell.classList.add("is-playing");
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          if (shell) {
            shell.classList.remove("is-playing");
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }

    video.addEventListener("play", function () {
      if (shell) {
        shell.classList.add("is-playing");
      }
    });

    video.addEventListener("pause", function () {
      if (shell && video.currentTime === 0) {
        shell.classList.remove("is-playing");
      }
    });

    video.addEventListener("click", function () {
      if (!isBound) {
        play();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.MovieSite = {
    initPlayer: initPlayer
  };

  document.addEventListener("DOMContentLoaded", function () {
    initNavigation();
    initHero();
    initFilters();
  });
})();
