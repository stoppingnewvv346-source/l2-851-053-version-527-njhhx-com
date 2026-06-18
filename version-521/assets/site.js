(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const navMenu = document.getElementById('navMenu');

  if (menuButton && navMenu) {
    menuButton.addEventListener('click', function () {
      const open = navMenu.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
  }

  const hero = document.querySelector('.hero-slider');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    const prev = hero.querySelector('[data-hero="prev"]');
    const next = hero.querySelector('[data-hero="next"]');
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  const filterPanel = document.querySelector('.filter-panel');

  if (filterPanel) {
    const input = filterPanel.querySelector('.movie-search');
    const buttons = Array.from(filterPanel.querySelectorAll('.filter-btn'));
    const cards = Array.from(document.querySelectorAll('.movie-card'));
    const query = new URLSearchParams(window.location.search).get('q');
    let currentFilter = 'all';

    function apply() {
      const term = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        const text = (card.getAttribute('data-text') || '').toLowerCase();
        const category = card.getAttribute('data-category') || '';
        const type = card.getAttribute('data-type') || '';
        const matchedText = !term || text.indexOf(term) !== -1;
        const matchedFilter = currentFilter === 'all' || category === currentFilter || type.indexOf(currentFilter) !== -1 || text.indexOf(currentFilter.toLowerCase()) !== -1;
        card.classList.toggle('hidden-card', !(matchedText && matchedFilter));
      });
    }

    if (input) {
      if (query) {
        input.value = query;
      }
      input.addEventListener('input', apply);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        currentFilter = button.getAttribute('data-filter') || 'all';
        buttons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        apply();
      });
    });

    apply();
  }
})();

function initMoviePlayer(streamUrl) {
  const box = document.getElementById('playerBox');
  const video = document.getElementById('movieVideo');
  const cover = document.getElementById('playCover');

  if (!box || !video || !cover || !streamUrl) {
    return;
  }

  let ready = false;

  function attach() {
    if (ready) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      ready = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      ready = true;
      return;
    }

    video.src = streamUrl;
    ready = true;
  }

  function play() {
    attach();
    box.classList.add('is-playing');
    const request = video.play();
    if (request && typeof request.catch === 'function') {
      request.catch(function () {});
    }
  }

  cover.addEventListener('click', play);
  box.addEventListener('click', function (event) {
    if (event.target === box) {
      play();
    }
  });
  video.addEventListener('play', function () {
    box.classList.add('is-playing');
  });
}
