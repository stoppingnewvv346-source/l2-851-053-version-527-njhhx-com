(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        if (!slides.length) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function setupFilters() {
        var input = document.querySelector('[data-search-input]');
        var cards = selectAll('[data-card]');
        var buttons = selectAll('[data-filter-value]');
        if (!cards.length) {
            return;
        }
        var activeFilter = 'all';
        function apply() {
            var query = input ? input.value.trim().toLowerCase() : '';
            cards.forEach(function (card) {
                var text = card.getAttribute('data-filter-text') || '';
                var matchesQuery = !query || text.indexOf(query) !== -1;
                var matchesFilter = activeFilter === 'all' || text.indexOf(activeFilter.toLowerCase()) !== -1;
                card.classList.toggle('is-hidden', !(matchesQuery && matchesFilter));
            });
        }
        if (input) {
            input.addEventListener('input', apply);
        }
        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeFilter = button.getAttribute('data-filter-value') || 'all';
                buttons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                apply();
            });
        });
    }

    window.ClassicPlayer = {
        mount: function (options) {
            if (!options) {
                return;
            }
            var video = document.getElementById(options.videoId);
            var overlay = document.getElementById(options.overlayId);
            var button = document.getElementById(options.playButtonId);
            var url = options.url;
            if (!video || !url) {
                return;
            }
            var ready = false;
            var hls = null;
            function attach() {
                if (ready) {
                    return;
                }
                ready = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                } else {
                    video.src = url;
                }
            }
            function start(event) {
                if (event) {
                    event.preventDefault();
                }
                attach();
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
                var play = video.play();
                if (play && typeof play.catch === 'function') {
                    play.catch(function () {});
                }
            }
            if (overlay) {
                overlay.addEventListener('click', start);
            }
            if (button) {
                button.addEventListener('click', start);
            }
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
            });
            window.addEventListener('pagehide', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        }
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
