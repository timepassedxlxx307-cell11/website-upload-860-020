(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function initMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var mobile = document.querySelector(".mobile-nav");
        if (!toggle || !mobile) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = mobile.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function initHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        slider.addEventListener("mouseenter", function () {
            window.clearInterval(timer);
        });
        slider.addEventListener("mouseleave", start);
        start();
    }

    function initSearchForms() {
        Array.prototype.slice.call(document.querySelectorAll("[data-search-form]")).forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                }
            });
        });
    }

    function getQueryValue(name) {
        try {
            return new URLSearchParams(window.location.search).get(name) || "";
        } catch (error) {
            return "";
        }
    }

    function initFilters() {
        Array.prototype.slice.call(document.querySelectorAll("[data-filter-section]")).forEach(function (section) {
            var search = section.querySelector("[data-filter-search]");
            var selects = Array.prototype.slice.call(section.querySelectorAll("[data-filter-select]"));
            var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card"));
            var empty = section.querySelector(".empty-state");
            var query = getQueryValue("q");
            if (search && query) {
                search.value = query;
            }
            function valueOf(card, key) {
                return (card.getAttribute("data-" + key) || "").toLowerCase();
            }
            function apply() {
                var keyword = search ? search.value.trim().toLowerCase() : "";
                var active = 0;
                cards.forEach(function (card) {
                    var haystack = ["title", "region", "genre", "year", "type", "tags"].map(function (key) {
                        return valueOf(card, key);
                    }).join(" ");
                    var pass = !keyword || haystack.indexOf(keyword) !== -1;
                    selects.forEach(function (select) {
                        var key = select.getAttribute("data-filter-select");
                        var val = select.value.trim().toLowerCase();
                        if (val && valueOf(card, key).indexOf(val) === -1) {
                            pass = false;
                        }
                    });
                    card.hidden = !pass;
                    if (pass) {
                        active += 1;
                    }
                });
                if (empty) {
                    empty.hidden = active !== 0;
                }
            }
            if (search) {
                search.addEventListener("input", apply);
            }
            selects.forEach(function (select) {
                select.addEventListener("change", apply);
            });
            apply();
        });
    }

    function attachPlayer(options) {
        var video = document.getElementById(options.videoId);
        var trigger = document.getElementById(options.triggerId);
        var source = options.source;
        if (!video || !trigger || !source) {
            return;
        }
        var loaded = false;
        var hls = null;
        function load() {
            if (loaded) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
            loaded = true;
        }
        function play() {
            load();
            trigger.classList.add("is-hidden");
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {
                    trigger.classList.remove("is-hidden");
                });
            }
        }
        trigger.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (!loaded || video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            trigger.classList.add("is-hidden");
        });
        video.addEventListener("ended", function () {
            trigger.classList.remove("is-hidden");
        });
        window.addEventListener("beforeunload", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initSearchForms();
        initFilters();
    });

    window.MovieSite = {
        attachPlayer: attachPlayer
    };
})();
