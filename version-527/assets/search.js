(function () {
  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get("q") || "").trim();
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function card(movie) {
    return [
      "<a class=\"movie-card\" href=\"" + movie.detail + "\">",
      "<span class=\"poster\">",
      "<img src=\"" + movie.image + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
      "<span class=\"poster-shade\"></span>",
      "<span class=\"play-badge\">▶</span>",
      "<span class=\"corner-badge\">" + escapeHtml(movie.type) + "</span>",
      "<span class=\"year-badge\">" + escapeHtml(movie.year) + "</span>",
      "</span>",
      "<strong>" + escapeHtml(movie.title) + "</strong>",
      "<span class=\"card-meta\">" + escapeHtml(movie.region) + " · " + escapeHtml(movie.genre) + "</span>",
      "</a>"
    ].join("");
  }

  function run() {
    var query = getQuery();
    var input = document.querySelector("[data-search-page-input]");
    var summary = document.querySelector("[data-search-summary]");
    var results = document.querySelector("[data-search-results]");
    var empty = document.querySelector("[data-search-empty]");
    var index = window.SEARCH_INDEX || [];
    if (input) {
      input.value = query;
    }
    if (!results || !summary) {
      return;
    }
    if (!query) {
      summary.textContent = "请输入关键词开始搜索。";
      if (empty) {
        empty.hidden = true;
      }
      return;
    }
    var words = query.toLowerCase().split(/\s+/).filter(Boolean);
    var matches = index.filter(function (movie) {
      var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(" ").toLowerCase();
      return words.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });
    });
    summary.textContent = "关键词“" + query + "”匹配到 " + matches.length + " 部影片。";
    results.innerHTML = matches.slice(0, 240).map(card).join("");
    if (empty) {
      empty.hidden = matches.length !== 0;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
