(function () {
  function prepare(box) {
    var video = box.querySelector("video");
    var button = box.querySelector(".play-overlay");

    if (!video || !button) {
      return;
    }

    function attach() {
      if (video.getAttribute("data-ready") !== "1") {
        var src = video.getAttribute("data-video");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else {
          video.src = src;
        }

        video.setAttribute("data-ready", "1");
      }

      button.classList.add("hidden");
      video.play().catch(function () {});
    }

    button.addEventListener("click", function (event) {
      event.preventDefault();
      attach();
    });
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(prepare);
})();
