(function () {
  var body = document.body;
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobilePanel.classList.toggle('open');
      body.classList.toggle('menu-open', isOpen);
      menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var heroTitle = document.querySelector('[data-hero-title]');
  var heroDesc = document.querySelector('[data-hero-desc]');
  var heroMeta = document.querySelector('[data-hero-meta]');
  var heroLinks = Array.prototype.slice.call(document.querySelectorAll('[data-hero-link]'));
  var heroCardImage = document.querySelector('[data-hero-card-image]');
  var heroCardTitle = document.querySelector('[data-hero-card-title]');
  var heroCardDesc = document.querySelector('[data-hero-card-desc]');
  var currentSlide = 0;

  function setHeroSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === currentSlide);
    });

    var slide = slides[currentSlide];
    var title = slide.getAttribute('data-title') || '';
    var desc = slide.getAttribute('data-desc') || '';
    var meta = slide.getAttribute('data-meta') || '';
    var link = slide.getAttribute('data-link') || '#';
    var img = slide.getAttribute('data-image') || '';

    if (heroTitle) {
      heroTitle.textContent = title;
    }
    if (heroDesc) {
      heroDesc.textContent = desc;
    }
    if (heroMeta) {
      heroMeta.textContent = meta;
    }
    heroLinks.forEach(function (item) {
      item.setAttribute('href', link);
    });
    if (heroCardImage) {
      heroCardImage.setAttribute('src', img);
      heroCardImage.setAttribute('alt', title);
    }
    if (heroCardTitle) {
      heroCardTitle.textContent = title;
    }
    if (heroCardDesc) {
      heroCardDesc.textContent = desc;
    }
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      setHeroSlide(index);
    });
  });

  if (slides.length) {
    setHeroSlide(0);
    window.setInterval(function () {
      setHeroSlide(currentSlide + 1);
    }, 5800);
  }

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));
  filterInputs.forEach(function (input) {
    var scopeSelector = input.getAttribute('data-filter-scope') || 'body';
    var scope = document.querySelector(scopeSelector) || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));

    input.addEventListener('input', function () {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
        card.classList.toggle('hidden-card', keyword && text.indexOf(keyword) === -1);
      });
    });
  });

  var chipGroups = Array.prototype.slice.call(document.querySelectorAll('[data-chip-group]'));
  chipGroups.forEach(function (group) {
    var scopeSelector = group.getAttribute('data-filter-scope') || 'body';
    var scope = document.querySelector(scopeSelector) || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
    var chips = Array.prototype.slice.call(group.querySelectorAll('[data-filter-value]'));

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var value = chip.getAttribute('data-filter-value') || '';
        chips.forEach(function (item) {
          item.classList.toggle('active', item === chip);
        });
        cards.forEach(function (card) {
          var cardValue = card.getAttribute('data-filter-type') || '';
          card.classList.toggle('hidden-card', value && value !== '全部' && cardValue !== value);
        });
      });
    });
  });
})();
