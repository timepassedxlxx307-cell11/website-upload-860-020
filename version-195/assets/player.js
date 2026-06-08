(function () {
  var script = document.currentScript;
  var streamUrl = script ? script.getAttribute("data-stream") : "";
  var player = document.querySelector("[data-player]");
  if (!player || !streamUrl) {
    return;
  }

  var video = player.querySelector("video");
  var cover = player.querySelector("[data-player-start]");
  var mounted = false;
  var hls = null;

  function mountStream() {
    if (mounted || !video) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      mounted = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      mounted = true;
      return;
    }

    video.src = streamUrl;
    mounted = true;
  }

  function hideCover() {
    if (cover) {
      cover.classList.add("is-hidden");
    }
  }

  function startPlayback() {
    mountStream();
    hideCover();
    video.controls = true;
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        video.controls = true;
      });
    }
  }

  if (cover) {
    cover.addEventListener("click", startPlayback);
  }

  video.addEventListener("click", function () {
    if (!mounted) {
      startPlayback();
    }
  });

  video.addEventListener("play", hideCover);
  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}());
