(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function bindMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!button || !menu) return;
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function bindCardSearch() {
    var inputs = document.querySelectorAll("[data-card-search]");
    inputs.forEach(function (input) {
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
      var empty = document.querySelector("[data-no-results]");
      var run = function () {
        var q = normalize(input.value);
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalize((card.dataset.title || "") + " " + (card.dataset.meta || "") + " " + card.textContent);
          var show = !q || text.indexOf(q) !== -1;
          card.style.display = show ? "" : "none";
          if (show) visible += 1;
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      };
      input.addEventListener("input", run);
      run();
    });
  }

  function bindSearchPage() {
    var input = document.querySelector("[data-search-page-input]");
    if (!input) return;
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    if (q) {
      input.value = q;
      input.dispatchEvent(new Event("input"));
    }
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) return;
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    if (!slides.length) return;
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function schedule() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        schedule();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        schedule();
      });
    });

    show(0);
    schedule();
  }

  ready(function () {
    bindMenu();
    bindCardSearch();
    bindSearchPage();
    initHero();
  });
})();

function initMoviePlayer(source) {
  var video = document.getElementById("movie-player");
  var button = document.getElementById("player-start");
  if (!video || !source) return;
  var hlsInstance = null;
  var loaded = false;

  function loadAndPlay() {
    if (loaded) {
      video.play().catch(function () {});
      return;
    }
    loaded = true;
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.play().catch(function () {});
    }
  }

  function start() {
    if (button) button.classList.add("is-hidden");
    loadAndPlay();
  }

  if (button) {
    button.addEventListener("click", start);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener("play", function () {
    if (button) button.classList.add("is-hidden");
  });

  video.addEventListener("pause", function () {
    if (button && video.currentTime > 0) button.classList.remove("is-hidden");
  });

  window.addEventListener("pagehide", function () {
    if (hlsInstance) hlsInstance.destroy();
  });
}
