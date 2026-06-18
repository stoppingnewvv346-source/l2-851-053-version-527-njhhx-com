(() => {
    const menuButton = document.querySelector("[data-menu-button]");
    const mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", () => {
            mobileMenu.classList.toggle("open");
        });
    }

    const hero = document.querySelector("[data-hero]");
    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        let index = 0;
        let timer = null;

        const showSlide = (nextIndex) => {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle("active", dotIndex === index);
            });
        };

        const startTimer = () => {
            window.clearInterval(timer);
            timer = window.setInterval(() => showSlide(index + 1), 5200);
        };

        dots.forEach((dot, dotIndex) => {
            dot.addEventListener("click", () => {
                showSlide(dotIndex);
                startTimer();
            });
        });

        if (slides.length > 1) {
            startTimer();
        }
    }

    document.querySelectorAll("[data-filter-form]").forEach((panel) => {
        const targetId = panel.getAttribute("data-target") || "movie-list";
        const target = document.getElementById(targetId) || document;
        const cards = Array.from(target.querySelectorAll("[data-movie-card]"));
        const searchInput = panel.querySelector("[data-filter-search]");
        const yearSelect = panel.querySelector("[data-filter-year]");
        const typeSelect = panel.querySelector("[data-filter-type]");
        const resetButton = panel.querySelector("[data-filter-reset]");
        const empty = panel.querySelector("[data-filter-empty]");

        const normalize = (value) => (value || "").toString().trim().toLowerCase();

        const applyFilter = () => {
            const keyword = normalize(searchInput ? searchInput.value : "");
            const year = normalize(yearSelect ? yearSelect.value : "");
            const type = normalize(typeSelect ? typeSelect.value : "");
            let visible = 0;

            cards.forEach((card) => {
                const haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(" "));
                const matchKeyword = !keyword || haystack.includes(keyword);
                const matchYear = !year || normalize(card.dataset.year) === year;
                const matchType = !type || normalize(card.dataset.type) === type;
                const matched = matchKeyword && matchYear && matchType;

                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        };

        [searchInput, yearSelect, typeSelect].forEach((control) => {
            if (control) {
                control.addEventListener("input", applyFilter);
                control.addEventListener("change", applyFilter);
            }
        });

        if (resetButton) {
            resetButton.addEventListener("click", () => {
                if (searchInput) {
                    searchInput.value = "";
                }
                if (yearSelect) {
                    yearSelect.value = "";
                }
                if (typeSelect) {
                    typeSelect.value = "";
                }
                applyFilter();
            });
        }
    });
})();

function setupMoviePlayer(source) {
    const video = document.querySelector(".movie-player");
    const cover = document.querySelector(".play-cover");
    let loaded = false;
    let hlsInstance = null;

    if (!video || !cover || !source) {
        return;
    }

    const playVideo = (restoreCover) => {
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {
                if (restoreCover) {
                    cover.classList.remove("hidden");
                }
            });
        }
    };

    const bindFallbackPlay = () => {
        video.addEventListener("loadedmetadata", () => playVideo(true), { once: true });
    };

    const start = () => {
        cover.classList.add("hidden");

        if (!loaded) {
            loaded = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                bindFallbackPlay();
                playVideo(false);
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, () => playVideo(true));
                hlsInstance.on(window.Hls.Events.ERROR, (event, data) => {
                    if (data && data.fatal) {
                        cover.classList.remove("hidden");
                    }
                });
                playVideo(false);
            } else {
                video.src = source;
                bindFallbackPlay();
                playVideo(false);
            }
        } else {
            playVideo(true);
        }
    };

    cover.addEventListener("click", start);

    video.addEventListener("click", () => {
        if (!loaded || video.paused) {
            start();
        }
    });

    window.addEventListener("pagehide", () => {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}
