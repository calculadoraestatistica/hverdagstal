/* Live-data paa hverdagstal.dk: elpris (Energi Data Service) og forbrugerprisindeks (DST).
   Udfylder <div data-live="elpris"> og <div data-live="cpi">. Ved fejl bliver den
   statiske forklaringstekst staaende, saa siden aldrig viser et tomt hul. */
(function () {
  "use strict";
  function dk(n, dec) {
    if (n === null || n === undefined || isNaN(n)) return "–";
    return Number(n).toLocaleString("da-DK", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }
  function datoDK(iso) {
    var d = new Date(iso + "T12:00:00");
    return d.toLocaleDateString("da-DK", { weekday: "long", day: "numeric", month: "long" });
  }
  function fig(label, value, unit) {
    return '<div class="live-figure"><b>' + value + '</b><span>' + label + (unit ? " · " + unit : "") + "</span></div>";
  }

  function renderElpris(box, data) {
    var areas = data.areas || {};
    // Dags dato i dansk tid (ISO-strengen ville give UTC-datoen og skifte dag kl. 02 dansk sommertid)
    var today = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Copenhagen" });
    var html = "";
    var shownDay = today;
    ["DK1", "DK2"].forEach(function (area) {
      var dage = areas[area] || {};
      var keys = Object.keys(dage).sort();
      if (!keys.length) return;
      var dag = dage[today] ? today : keys[keys.length - 1];
      shownDay = dag;
      var v = dage[dag];
      var navn = area === "DK1" ? "Vestdanmark (DK1)" : "Østdanmark (DK2)";
      html += '<div class="live-figures">' +
        fig(navn + " · gennemsnit", dk(v.avg, 0), "øre/kWh") +
        fig("laveste kvarter", dk(v.min, 0), "øre/kWh") +
        fig("højeste kvarter", dk(v.max, 0), "øre/kWh") +
        "</div>";
      var imorgen = keys.filter(function (k) { return k > dag; })[0];
      if (imorgen) {
        html += '<p class="live-meta">I morgen (' + datoDK(imorgen) + "): gennemsnit " + dk(dage[imorgen].avg, 0) + " øre/kWh i " + navn + ".</p>";
      }
    });
    if (!html) return;
    var el = box.querySelector("[data-live-target]");
    el.innerHTML = html + '<p class="live-meta">Spotpris for ' + datoDK(shownDay) +
      ", ekskl. nettarif, elafgift og moms. Kilde: <a href=\"" + data.source_url + "\" rel=\"noopener\" target=\"_blank\">Energi Data Service</a>. Opdateret " +
      new Date(data.updated).toLocaleString("da-DK", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) + ".</p>";
    if (shownDay !== today) {
      var h3 = box.querySelector("h3");
      if (h3) h3.textContent = "Elprisen " + datoDK(shownDay) + " (spotpris)";
    }
    box.hidden = false;
  }

  function renderCpi(box, data) {
    var el = box.querySelector("[data-live-target]");
    var yoy = data.yoy_pct;
    el.innerHTML = '<div class="live-figures">' +
      fig("inflation, seneste 12 måneder", (yoy > 0 ? "+" : "") + dk(yoy, 1) + " %", "") +
      fig("forbrugerprisindeks (2025 = 100)", dk(data.index, 1), "") +
      (data.mom_pct !== null && data.mom_pct !== undefined ? fig("ændring fra måneden før", (data.mom_pct > 0 ? "+" : "") + dk(data.mom_pct, 1) + " %", "") : "") +
      "</div>" +
      '<p class="live-meta">Seneste måned: ' + (data.period_label || data.period) + ". Kilde: <a href=\"" + data.source_url +
      "\" rel=\"noopener\" target=\"_blank\">Danmarks Statistik, PRIS01</a>.</p>";
    box.hidden = false;
  }

  function load(kind, render) {
    var boxes = document.querySelectorAll('[data-live="' + kind + '"]');
    if (!boxes.length) return;
    fetch("/data/" + kind + ".json", { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) { boxes.forEach(function (b) { render(b, data); }); })
      .catch(function () { /* statisk tekst bliver staaende */ });
  }
  document.addEventListener("DOMContentLoaded", function () {
    load("elpris", renderElpris);
    load("cpi", renderCpi);
  });
})();
