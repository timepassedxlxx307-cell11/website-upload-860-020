(function() {
    var input = document.getElementById('search-input');
    var resultBox = document.getElementById('search-results');
    var summary = document.getElementById('search-summary');
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    if (input) {
        input.value = query;
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function(char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function card(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function(tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '<article class="movie-card">' +
            '<a class="poster-link" href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">' +
            '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
            '<span class="card-rating">' + escapeHtml(movie.rating) + '</span>' +
            '</a>' +
            '<div class="card-body">' +
            '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
            '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>' +
            '<p>' + escapeHtml(movie.oneLine) + '</p>' +
            '<div class="tag-row">' + tags + '</div>' +
            '</div>' +
            '</article>';
    }

    function runSearch(term) {
        var key = term.toLowerCase();
        var list = (window.SiteMovies || []).filter(function(movie) {
            var content = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine].concat(movie.tags || []).join(' ').toLowerCase();
            return !key || content.indexOf(key) !== -1;
        }).slice(0, 120);
        if (summary) {
            summary.textContent = key ? '找到 ' + list.length + ' 部相关影片' : '热门影视作品';
        }
        if (resultBox) {
            resultBox.innerHTML = list.map(card).join('');
        }
    }

    runSearch(query);
})();
