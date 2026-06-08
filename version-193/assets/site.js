(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;
        var timer = null;

        var show = function (nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        };

        var start = function () {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        };

        var restart = function () {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        };

        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');

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
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        show(0);
        start();
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var filterType = document.querySelector('[data-filter-type]');
    var filterList = document.querySelector('[data-filter-list]');

    if (filterInput && filterList) {
        var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));

        var applyFilter = function () {
            var keyword = filterInput.value.trim().toLowerCase();
            var type = filterType ? filterType.value : '';

            cards.forEach(function (item) {
                var text = [
                    item.getAttribute('data-title'),
                    item.getAttribute('data-region'),
                    item.getAttribute('data-type'),
                    item.getAttribute('data-year'),
                    item.getAttribute('data-genre'),
                    item.getAttribute('data-tags')
                ].join(' ').toLowerCase();
                var itemType = item.getAttribute('data-type') || '';
                var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchedType = !type || itemType.indexOf(type) !== -1;

                item.classList.toggle('is-hidden', !(matchedKeyword && matchedType));
            });
        };

        filterInput.addEventListener('input', applyFilter);

        if (filterType) {
            filterType.addEventListener('change', applyFilter);
        }
    }

    var players = Array.prototype.slice.call(document.querySelectorAll('video[data-video]'));

    players.forEach(function (video) {
        var box = video.closest('.player-box');
        var button = box ? box.querySelector('.play-overlay') : null;
        var mediaUrl = video.getAttribute('data-video');
        var loaded = false;
        var hlsInstance = null;

        var load = function () {
            if (loaded || !mediaUrl) {
                return;
            }

            loaded = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = mediaUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(mediaUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = mediaUrl;
            }
        };

        var play = function () {
            load();
            if (box) {
                box.classList.add('is-playing');
            }
            var result = video.play();
            if (result && result.catch) {
                result.catch(function () {});
            }
        };

        if (button) {
            button.addEventListener('click', play);
        }

        video.addEventListener('play', function () {
            if (box) {
                box.classList.add('is-playing');
            }
        });

        video.addEventListener('pause', function () {
            if (box && video.currentTime === 0) {
                box.classList.remove('is-playing');
            }
        });

        video.addEventListener('loadedmetadata', function () {
            if (hlsInstance) {
                hlsInstance.currentLevel = -1;
            }
        });
    });
})();
