(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('is-hidden');
    });
  });

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    var nextButton = hero.querySelector('[data-hero-next]');
    var prevButton = hero.querySelector('[data-hero-prev]');

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        showSlide(current + 1);
      });
    }

    if (prevButton) {
      prevButton.addEventListener('click', function () {
        showSlide(current - 1);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')));
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function applyFilters(scope) {
    var queryInput = scope.querySelector('[data-search-input]');
    var typeSelect = scope.querySelector('[data-filter-select="type"]');
    var yearSelect = scope.querySelector('[data-filter-select="year"]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var emptyTip = scope.querySelector('[data-empty-tip]');
    var query = queryInput ? queryInput.value.trim().toLowerCase() : '';
    var type = typeSelect ? typeSelect.value : '';
    var year = yearSelect ? yearSelect.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var text = card.getAttribute('data-search') || '';
      var cardType = card.getAttribute('data-type') || '';
      var cardYear = Number(card.getAttribute('data-year') || '0');
      var matched = true;

      if (query && text.indexOf(query) === -1) {
        matched = false;
      }

      if (type && cardType !== type) {
        matched = false;
      }

      if (year) {
        if (year === 'older') {
          matched = matched && cardYear < 2020;
        } else {
          matched = matched && cardYear === Number(year);
        }
      }

      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (emptyTip) {
      emptyTip.classList.toggle('show', visible === 0);
    }
  }

  document.querySelectorAll('[data-card-scope]').forEach(function (scope) {
    var controls = scope.querySelectorAll('[data-search-input], [data-filter-select]');
    controls.forEach(function (control) {
      control.addEventListener('input', function () {
        applyFilters(scope);
      });
      control.addEventListener('change', function () {
        applyFilters(scope);
      });
    });
    applyFilters(scope);
  });

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q');

  if (query) {
    var firstSearch = document.querySelector('[data-search-input]');
    var firstScope = firstSearch ? firstSearch.closest('[data-card-scope]') : null;
    if (firstSearch && firstScope) {
      firstSearch.value = query;
      applyFilters(firstScope);
      firstSearch.scrollIntoView({ block: 'center' });
    }
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var stream = player.getAttribute('data-stream');
    var started = false;
    var hlsInstance = null;

    function startPlayback() {
      if (!video || !stream) {
        return;
      }

      player.classList.add('playing');

      if (!started) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
        started = true;
      }

      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          player.classList.remove('playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', startPlayback);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        }
      });
      video.addEventListener('play', function () {
        player.classList.add('playing');
      });
      video.addEventListener('ended', function () {
        player.classList.remove('playing');
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance && hlsInstance.destroy) {
        hlsInstance.destroy();
      }
    });
  });
})();
