(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileNav() {
    var toggle = $('[data-mobile-toggle]');
    var nav = $('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slider = $('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = $all('[data-hero-slide]', slider);
    var dots = $all('[data-hero-dot]', slider);
    var prev = $('[data-hero-prev]', slider);
    var next = $('[data-hero-next]', slider);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        restart();
      });
    });

    show(0);
    restart();
  }

  function setupCardFilter() {
    var input = $('[data-filter-input]');
    var list = $('[data-filter-list]');
    if (!input || !list) {
      return;
    }
    var cards = $all('[data-card]', list);
    input.addEventListener('input', function () {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search-text') || '').toLowerCase();
        card.classList.toggle('is-hidden', keyword && text.indexOf(keyword) === -1);
      });
    });
  }

  function cardTemplate(item) {
    var text = [item.title, item.year, item.region, item.type, item.genre, (item.tags || []).join(' ')].join(' ');
    return '' +
      '<article class="movie-card" data-card data-search-text="' + escapeAttr(text) + '">' +
      '<a href="' + escapeAttr(item.url) + '" aria-label="' + escapeAttr(item.title) + '">' +
      '<div class="poster-wrap">' +
      '<img src="' + escapeAttr(item.cover) + '" alt="' + escapeAttr(item.title) + '" loading="lazy">' +
      '<span class="duration-badge">' + escapeHtml(item.duration) + '</span>' +
      '<span class="rating-badge">★ ' + escapeHtml(item.rating) + '</span>' +
      '<span class="play-badge">▶</span>' +
      '</div>' +
      '<div class="movie-card-body">' +
      '<h3>' + escapeHtml(item.title) + '</h3>' +
      '<p class="card-excerpt">' + escapeHtml(item.oneLine || '') + '</p>' +
      '<p class="movie-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></p>' +
      '</div>' +
      '</a>' +
      '</article>';
  }

  function setupSearchPage() {
    var input = $('#site-search-input');
    var type = $('#site-search-type');
    var button = $('#site-search-button');
    var results = $('#search-results');
    var title = $('#search-title');
    var data = window.MOVIE_SEARCH_DATA || [];
    if (!input || !results || !data.length) {
      return;
    }

    function params() {
      var query = new URLSearchParams(window.location.search).get('q') || '';
      input.value = query;
    }

    function run() {
      var keyword = input.value.trim().toLowerCase();
      var typeValue = type ? type.value : '';
      var matched = data.filter(function (item) {
        var text = [item.title, item.year, item.region, item.type, item.genre, (item.tags || []).join(' ')].join(' ').toLowerCase();
        var passKeyword = !keyword || text.indexOf(keyword) !== -1;
        var passType = !typeValue || item.type === typeValue;
        return passKeyword && passType;
      }).slice(0, 96);
      if (keyword || typeValue) {
        title.textContent = '搜索结果';
        results.innerHTML = matched.length ? matched.map(cardTemplate).join('') : '<p class="empty-result">没有找到匹配影片</p>';
      }
    }

    params();
    run();
    input.addEventListener('input', run);
    if (type) {
      type.addEventListener('change', run);
    }
    if (button) {
      button.addEventListener('click', run);
    }
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  window.initMoviePlayer = function (url) {
    var box = $('[data-player-box]');
    var video = $('#movie-player');
    var trigger = $('[data-play-trigger]');
    if (!box || !video || !url) {
      return;
    }
    var loaded = false;
    var hlsInstance = null;

    function start() {
      if (!loaded) {
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls();
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
        } else {
          video.src = url;
        }
      }
      box.classList.add('is-playing');
      video.controls = true;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (trigger) {
      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        start();
      });
    }
    box.addEventListener('click', start);
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileNav();
    setupHero();
    setupCardFilter();
    setupSearchPage();
  });
})();
