function initMoviePlayer(source) {
  var video = document.getElementById("moviePlayer");
  var overlay = document.querySelector("[data-play-overlay]");
  var hlsInstance = null;

  if (!video) {
    return;
  }

  function prepare() {
    if (video.getAttribute("data-ready") === "1") {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.setAttribute("data-ready", "1");
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      video.setAttribute("data-ready", "1");
      return;
    }

    video.src = source;
    video.setAttribute("data-ready", "1");
  }

  function playVideo() {
    prepare();

    if (overlay) {
      overlay.classList.add("is-hidden");
    }

    var promise = video.play();

    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });
    }
  }

  if (overlay) {
    overlay.addEventListener("click", playVideo);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      playVideo();
    }
  });

  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });

  video.addEventListener("pause", function () {
    if (video.currentTime === 0 && overlay) {
      overlay.classList.remove("is-hidden");
    }
  });

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
