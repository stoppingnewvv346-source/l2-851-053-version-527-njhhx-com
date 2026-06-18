(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return "0:00";
    }
    var minutes = Math.floor(seconds / 60);
    var rest = Math.floor(seconds % 60);
    return minutes + ":" + String(rest).padStart(2, "0");
  }

  function setupMenu() {
    var button = document.querySelector("[data-mobile-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", menu.classList.contains("is-open"));
    });
  }

  function setupSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input) {
          return;
        }
        var value = input.value.trim();
        if (!value) {
          event.preventDefault();
          input.focus();
          return;
        }
        event.preventDefault();
        window.location.href = "./search.html?q=" + encodeURIComponent(value);
      });
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;
    function activate(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }
    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        activate(current + 1);
      }, 5600);
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        activate(index);
        start();
      });
    });
    root.addEventListener("mouseenter", function () {
      window.clearInterval(timer);
    });
    root.addEventListener("mouseleave", start);
    start();
  }

  function setupFilters() {
    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var textInput = scope.querySelector("[data-filter-text]");
      var typeInput = scope.querySelector("[data-filter-type]");
      var yearInput = scope.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
      var empty = scope.querySelector("[data-filter-empty]");
      function apply() {
        var text = textInput ? textInput.value.trim().toLowerCase() : "";
        var type = typeInput ? typeInput.value : "";
        var year = yearInput ? yearInput.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.year, card.dataset.genre].join(" ").toLowerCase();
          var matchText = !text || haystack.indexOf(text) !== -1;
          var matchType = !type || card.dataset.type === type;
          var matchYear = !year || card.dataset.year === year;
          var show = matchText && matchType && matchYear;
          card.hidden = !show;
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }
      [textInput, typeInput, yearInput].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  function setupPlayers() {
    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var stream = player.getAttribute("data-stream");
      var playButton = player.querySelector("[data-player-play]");
      var toggleButton = player.querySelector("[data-player-toggle]");
      var muteButton = player.querySelector("[data-player-mute]");
      var fullButton = player.querySelector("[data-player-fullscreen]");
      var progress = player.querySelector("[data-player-progress]");
      var fill = player.querySelector("[data-player-fill]");
      var time = player.querySelector("[data-player-time]");
      var hls = null;
      var attached = false;
      if (!video || !stream) {
        return;
      }
      function attach() {
        if (attached) {
          return;
        }
        attached = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          video.load();
        } else {
          video.src = stream;
          video.load();
        }
      }
      function play() {
        attach();
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {});
        }
      }
      function toggle() {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      }
      function update() {
        var duration = video.duration || 0;
        var current = video.currentTime || 0;
        var percent = duration > 0 ? Math.min(100, Math.max(0, current / duration * 100)) : 0;
        if (fill) {
          fill.style.width = percent + "%";
        }
        if (time) {
          time.textContent = formatTime(current) + " / " + formatTime(duration);
        }
      }
      if (playButton) {
        playButton.addEventListener("click", play);
      }
      if (toggleButton) {
        toggleButton.addEventListener("click", toggle);
      }
      video.addEventListener("click", toggle);
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
        if (toggleButton) {
          toggleButton.textContent = "暂停";
        }
      });
      video.addEventListener("pause", function () {
        player.classList.remove("is-playing");
        if (toggleButton) {
          toggleButton.textContent = "▶";
        }
      });
      video.addEventListener("timeupdate", update);
      video.addEventListener("durationchange", update);
      video.addEventListener("loadedmetadata", update);
      if (muteButton) {
        muteButton.addEventListener("click", function () {
          video.muted = !video.muted;
          muteButton.textContent = video.muted ? "静音" : "音量";
        });
      }
      if (fullButton) {
        fullButton.addEventListener("click", function () {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else if (player.requestFullscreen) {
            player.requestFullscreen();
          }
        });
      }
      if (progress) {
        progress.addEventListener("click", function (event) {
          var duration = video.duration || 0;
          if (!duration) {
            return;
          }
          var rect = progress.getBoundingClientRect();
          var ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
          video.currentTime = ratio * duration;
        });
      }
      window.addEventListener("beforeunload", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupSearchForms();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
