(function () {
  var shell = document.querySelector('[data-player]');
  if (!shell) {
    return;
  }

  var video = shell.querySelector('video');
  var button = shell.querySelector('[data-play]');
  var stream = '';
  var hlsInstance = null;

  if (button && button.getAttribute('data-stream')) {
    stream = button.getAttribute('data-stream');
  } else if (video && video.getAttribute('data-stream')) {
    stream = video.getAttribute('data-stream');
  }

  function markPlaying() {
    shell.classList.add('is-playing');
  }

  function loadLibrary(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var existing = document.querySelector('script[data-hls-loader]');
    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      return;
    }
    var script = document.createElement('script');
    script.src = ['https:', '', 'cdn.jsdelivr.net', 'npm', 'hls.js@latest'].join('/');
    script.async = true;
    script.setAttribute('data-hls-loader', 'true');
    script.addEventListener('load', callback, { once: true });
    document.head.appendChild(script);
  }

  function attachStream() {
    if (!video || !stream) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (video.src !== stream) {
        video.src = stream;
      }
      markPlaying();
      var nativePlay = video.play();
      if (nativePlay && typeof nativePlay.catch === 'function') {
        nativePlay.catch(function () {});
      }
      return;
    }

    loadLibrary(function () {
      if (window.Hls && window.Hls.isSupported()) {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          markPlaying();
          var promise = video.play();
          if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
          }
        });
      } else {
        video.src = stream;
        markPlaying();
        var fallbackPlay = video.play();
        if (fallbackPlay && typeof fallbackPlay.catch === 'function') {
          fallbackPlay.catch(function () {});
        }
      }
    });
  }

  if (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      attachStream();
    });
  }

  shell.addEventListener('click', function (event) {
    if (event.target === video) {
      return;
    }
    if (!shell.classList.contains('is-playing')) {
      attachStream();
    }
  });

  if (video) {
    video.addEventListener('play', markPlaying);
  }
})();
