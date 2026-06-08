(function () {
  var toggle = document.querySelector('.menu-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  var spotlight = document.querySelector('[data-spotlight]');
  if (spotlight) {
    var slides = Array.prototype.slice.call(spotlight.querySelectorAll('.spotlight-slide'));
    var dots = Array.prototype.slice.call(spotlight.querySelectorAll('.spotlight-dot'));
    var index = 0;
    var timer = null;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
        start();
      });
    });

    spotlight.addEventListener('mouseenter', stop);
    spotlight.addEventListener('mouseleave', start);
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
  searchInputs.forEach(function (input) {
    var container = document.querySelector('.search-scope') || document;
    input.addEventListener('input', function () {
      var query = normalize(input.value);
      var cards = Array.prototype.slice.call(container.querySelectorAll('.movie-card'));
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-meta'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' '));
        card.classList.toggle('is-hidden', Boolean(query) && haystack.indexOf(query) === -1);
      });
    });
  });

  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var value = button.getAttribute('data-filter');
      var scope = document.querySelector('.search-scope') || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
      filterButtons.forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-meta'),
          card.getAttribute('data-tags')
        ].join(' '));
        card.classList.toggle('is-hidden', value !== 'all' && text.indexOf(normalize(value)) === -1);
      });
    });
  });
})();
