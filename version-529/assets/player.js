(function () {
    window.initMoviePlayer = function (source) {
        var video = document.getElementById("movie-player");
        var button = document.getElementById("play-toggle");
        var frame = document.querySelector(".video-frame");
        var hls = null;
        var attached = false;

        function attachSource() {
            if (!video || attached) {
                return;
            }

            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                return;
            }

            video.src = source;
        }

        function startPlayback() {
            if (!video) {
                return;
            }

            attachSource();
            if (button) {
                button.classList.add("is-hidden");
            }
            if (frame) {
                frame.classList.add("is-playing");
            }

            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    if (button) {
                        button.classList.remove("is-hidden");
                    }
                    if (frame) {
                        frame.classList.remove("is-playing");
                    }
                });
            }
        }

        if (button) {
            button.addEventListener("click", startPlayback);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    startPlayback();
                }
            });
            video.addEventListener("play", function () {
                if (button) {
                    button.classList.add("is-hidden");
                }
                if (frame) {
                    frame.classList.add("is-playing");
                }
            });
            video.addEventListener("pause", function () {
                if (button && video.currentTime === 0) {
                    button.classList.remove("is-hidden");
                }
            });
        }

        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
