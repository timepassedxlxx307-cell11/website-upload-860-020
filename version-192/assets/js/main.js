function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

function setupMobileMenu() {
  var button = document.getElementById("mobile-toggle");
  var menu = document.getElementById("mobile-menu");
  if (!button || !menu) {
    return;
  }
  button.addEventListener("click", function () {
    menu.classList.toggle("is-open");
  });
}

function setupHero() {
  var carousel = document.getElementById("hero-carousel");
  if (!carousel) {
    return;
  }
  var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
  var prev = carousel.querySelector("[data-hero-prev]");
  var next = carousel.querySelector("[data-hero-next]");
  var index = 0;
  var timer = null;

  function show(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === index);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === index);
    });
  }

  function start() {
    clearInterval(timer);
    timer = setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      show(Number(dot.getAttribute("data-slide")) || 0);
      start();
    });
  });

  if (prev) {
    prev.addEventListener("click", function () {
      show(index - 1);
      start();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      show(index + 1);
      start();
    });
  }

  start();
}

function setupSearch() {
  var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
  if (!inputs.length) {
    return;
  }
  var activeYear = "all";
  var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-year]"));
  var cards = Array.prototype.slice.call(document.querySelectorAll(".is-searchable .movie-card, .is-searchable .ranking-row"));
  var empty = document.querySelector(".no-results");

  function currentQuery() {
    return inputs.map(function (input) {
      return input.value.trim().toLowerCase();
    }).filter(Boolean).join(" ");
  }

  function apply() {
    var query = currentQuery();
    var shown = 0;
    cards.forEach(function (card) {
      var text = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-meta") || "")).toLowerCase();
      var year = card.getAttribute("data-year") || "";
      var matchText = !query || text.indexOf(query) !== -1;
      var matchYear = activeYear === "all" || year === activeYear;
      var visible = matchText && matchYear;
      card.hidden = !visible;
      if (visible) {
        shown += 1;
      }
    });
    if (empty) {
      empty.hidden = shown !== 0;
    }
  }

  inputs.forEach(function (input) {
    input.addEventListener("input", apply);
  });

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeYear = button.getAttribute("data-filter-year") || "all";
      buttons.forEach(function (item) {
        item.classList.toggle("is-active", item === button);
      });
      apply();
    });
  });
}

function initMoviePlayer(streamUrl) {
  var video = document.getElementById("movie-video");
  var overlay = document.getElementById("play-overlay");
  var started = false;
  if (!video) {
    return;
  }

  function begin() {
    if (started) {
      video.play().catch(function () {});
      return;
    }
    started = true;
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      video.addEventListener("loadedmetadata", function () {
        video.play().catch(function () {});
      }, { once: true });
      video.load();
      return;
    }
    if (typeof Hls !== "undefined" && Hls.isSupported()) {
      var hls = new Hls({ enableWorker: true });
      video._player = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      return;
    }
    video.src = streamUrl;
    video.play().catch(function () {});
  }

  if (overlay) {
    overlay.addEventListener("click", begin);
  }
  video.addEventListener("click", function () {
    if (!started) {
      begin();
    }
  });
}

ready(function () {
  setupMobileMenu();
  setupHero();
  setupSearch();
});
