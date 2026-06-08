(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('[data-player-cover]');
    var playButton = player.querySelector('[data-player-button]');
    var source = player.getAttribute('data-video-url');
    var hasStarted = false;
    var hlsInstance = null;

    function startPlayback() {
      if (!video || !source) {
        return;
      }

      if (cover) {
        cover.classList.add('is-hidden');
      }

      video.setAttribute('controls', 'controls');

      if (!hasStarted) {
        hasStarted = true;

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 60
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
              promise.catch(function () {});
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
              promise.catch(function () {});
            }
          }, { once: true });
        } else {
          video.src = source;
          var fallbackPromise = video.play();
          if (fallbackPromise && typeof fallbackPromise.catch === 'function') {
            fallbackPromise.catch(function () {});
          }
        }
      } else {
        var replayPromise = video.play();
        if (replayPromise && typeof replayPromise.catch === 'function') {
          replayPromise.catch(function () {});
        }
      }
    }

    if (cover) {
      cover.addEventListener('click', startPlayback);
    }

    if (playButton) {
      playButton.addEventListener('click', function (event) {
        event.stopPropagation();
        startPlayback();
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (hasStarted && !video.paused) {
          video.pause();
        } else {
          startPlayback();
        }
      });

      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    }
  });
})();
