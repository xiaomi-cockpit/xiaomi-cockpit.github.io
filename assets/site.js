/* Xiaomi Cockpit website: theme, the animated cockpit background with accent bubbles, glass edge glow, small helpers. */
(function () {
  "use strict";
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- theme (follows the system until the visitor chooses) ---------- */
  var KEY = "cockpit-theme";
  function systemTheme() { return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"; }
  function currentTheme() { return root.getAttribute("data-theme") || "dark"; }
  function setTheme(t, save) {
    root.setAttribute("data-theme", t);
    if (save) { try { localStorage.setItem(KEY, t); } catch (e) {} }
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute("content", t === "light" ? "#a7b4c1" : "#0a1621");
    applyAccent(accent.cur);
  }
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  /* the inline script in the page head already chose the theme (?theme=light or ?theme=dark overrides it) */
  if (root.getAttribute("data-theme") !== "light" && root.getAttribute("data-theme") !== "dark") root.setAttribute("data-theme", saved === "light" || saved === "dark" ? saved : systemTheme());
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: light)");
    var onSys = function () { var s = null; try { s = localStorage.getItem(KEY); } catch (e) {} if (!s) setTheme(systemTheme(), false); };
    if (mq.addEventListener) mq.addEventListener("change", onSys); else if (mq.addListener) mq.addListener(onSys);
  }

  /* ---------- accent colours (the app's accent list; the site walks through them) ---------- */
  var ACCENTS = {
    dark:  ["#7fe3c4", "#7cc7ff", "#b9a3ff", "#ff9ec4", "#ffb36b", "#f4db6a", "#ff8e86", "#b4e86a"],
    light: ["#14a383", "#1a7fd6", "#6a4bd6", "#d6336f", "#d9650f", "#a77f00", "#d23a2f", "#4d8f12"]
  };
  function hex2rgb(h) { return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; }
  var accent = { idx: Math.floor(Math.random() * 8), cur: null, from: null, to: null, t: 1 };
  function paletteRGB(i) { return hex2rgb(ACCENTS[currentTheme() === "light" ? "light" : "dark"][i % 8]); }
  accent.cur = paletteRGB(accent.idx);
  function applyAccent(c) {
    var r = Math.round(c[0]), g = Math.round(c[1]), b = Math.round(c[2]);
    root.style.setProperty("--accent", "rgb(" + r + "," + g + "," + b + ")");
    root.style.setProperty("--accent-rgb", r + "," + g + "," + b);
    var lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    root.style.setProperty("--on-accent", lum > 0.55 ? "#06222b" : "#ffffff");
  }
  function nextAccent() {
    accent.idx = (accent.idx + 1) % 8;
    accent.from = accent.cur.slice();
    accent.to = paletteRGB(accent.idx);
    accent.t = 0;
    if (reduce) { accent.cur = accent.to.slice(); accent.t = 1; applyAccent(accent.cur); }
  }
  applyAccent(accent.cur);
  if (!reduce) setInterval(nextAccent, 7000);

  /* ---------- the cockpit background ---------- */
  var cv = document.getElementById("bg");
  var ctx = cv && cv.getContext ? cv.getContext("2d") : null;
  var W = 0, H = 0, SCALE = 0.55;
  var bubbles = [
    { r: 0.40, ax: 0.30, bx: 0.10, ay: 0.42, by: 0.16, sx: 0.050, sy: 0.071, px: 0.5, py: 0.0, dark: [1.0, 120], light: [0.0, 150] },
    { r: 0.30, ax: 0.78, bx: 0.08, ay: 0.62, by: 0.14, sx: 0.043, sy: 0.059, px: 2.0, py: 1.0, dark: [0.63, 95], light: [0.12, 125] },
    { r: 0.35, ax: 0.55, bx: 0.14, ay: 0.18, by: 0.10, sx: 0.037, sy: 0.047, px: 4.0, py: 3.0, dark: [0.88, 105], light: [0.06, 135] }
  ];
  var pools = [
    { r: 0.62, ax: 0.20, bx: 0.12, ay: 0.20, by: 0.14, sx: 0.021, sy: 0.027, px: 0.0, py: 1.0, dark: ["63,108,138", 0.37], light: ["255,255,255", 0.74] },
    { r: 0.55, ax: 0.85, bx: 0.10, ay: 0.80, by: 0.10, sx: 0.025, sy: 0.019, px: 2.0, py: 0.0, dark: ["36,68,94", 0.33], light: ["169,192,214", 0.47] },
    { r: 0.50, ax: 0.55, bx: 0.14, ay: 0.55, by: 0.12, sx: 0.017, sy: 0.023, px: 3.0, py: 2.0, dark: ["92,134,163", 0.22], light: ["255,255,255", 0.58] }
  ];
  var bpos = []; /* current bubble centres and radii in CSS pixels (for the edge glow) */

  var lastT = 3;
  function resize() {
    if (!cv) return;
    var nw = Math.max(1, Math.round(window.innerWidth * SCALE));
    var nh = Math.max(1, Math.round(window.innerHeight * SCALE));
    /* Phones change the window height all the time (address bar, pull to refresh). Resetting the canvas then clears it
       for a moment (a black flash), so a small height change just stretches the canvas a little. */
    if (W && nw === W && Math.abs(nh - H) < H * 0.3) return;
    W = nw; H = nh;
    cv.width = W; cv.height = H;
    draw(lastT);
  }
  function mix(c, to, f) { return [c[0] + (to[0] - c[0]) * f, c[1] + (to[1] - c[1]) * f, c[2] + (to[2] - c[2]) * f]; }
  function rgba(c, a) { return "rgba(" + Math.round(c[0]) + "," + Math.round(c[1]) + "," + Math.round(c[2]) + "," + a + ")"; }
  var t0 = performance.now();
  var last = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    if (now - last < 33) return; /* about 30 frames a second is plenty for soft light */
    var dt = Math.min(0.1, (now - (last || now)) / 1000);
    last = now;
    if (accent.t < 1) {
      accent.t = Math.min(1, accent.t + dt / 1.6);
      var e = accent.t < .5 ? 2 * accent.t * accent.t : 1 - Math.pow(-2 * accent.t + 2, 2) / 2;
      accent.cur = mix(accent.from, accent.to, e);
      applyAccent(accent.cur);
    }
    lastT = (now - t0) / 1000;
    draw(lastT);
    updateGlow();
  }
  function draw(t) {
    if (!ctx) return;
    var dark = currentTheme() !== "light";
    var m = Math.min(W, H);
    if (dark) {
      var g = ctx.createLinearGradient(0, 0, W * 0.45, H);
      g.addColorStop(0, "#0a1621"); g.addColorStop(1, "#102232");
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = "#a7b4c1";
    }
    ctx.fillRect(0, 0, W, H);
    var i, p, x, y, R, rg;
    for (i = 0; i < pools.length; i++) {
      p = pools[i];
      x = W * (p.ax + p.bx * Math.sin(t * p.sx * 6.283 + p.px));
      y = H * (p.ay + p.by * Math.cos(t * p.sy * 6.283 + p.py));
      R = Math.max(W, H) * p.r;
      var pd = dark ? p.dark : p.light;
      rg = ctx.createRadialGradient(x, y, 0, x, y, R);
      rg.addColorStop(0, "rgba(" + pd[0] + "," + pd[1] + ")");
      rg.addColorStop(1, "rgba(" + pd[0] + ",0)");
      ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
    }
    var ac = accent.cur, white = [255, 255, 255];
    bpos.length = 0;
    for (i = 0; i < bubbles.length; i++) {
      p = bubbles[i];
      x = W * (p.ax + p.bx * Math.sin(t * p.sx * 6.283 + p.px));
      y = H * (p.ay + p.by * Math.cos(t * p.sy * 6.283 + p.py));
      R = Math.max(m, Math.min(W, H) * 0.9) * p.r * 1.05;
      var col, a;
      if (dark) { col = [ac[0] * p.dark[0], ac[1] * p.dark[0], ac[2] * p.dark[0]]; a = p.dark[1] / 255; }
      else { col = mix(ac, white, p.light[0]); a = p.light[1] / 255 * 0.78; }
      rg = ctx.createRadialGradient(x, y, 0, x, y, R);
      rg.addColorStop(0, rgba(col, a));
      rg.addColorStop(0.45, rgba(col, a * 0.7));
      rg.addColorStop(0.8, rgba(col, a * 0.25));
      rg.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
      bpos.push({ x: x / SCALE, y: y / SCALE, r: R / SCALE });
    }
  }

  /* ---------- glass edge glow: the accent lights the rim of a panel only where a bubble crosses its edge ---------- */
  var glass = [];
  var visible = new Set();
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) visible.add(e.target); else visible.delete(e.target); });
  }, { rootMargin: "120px" }) : null;
  function collectGlass() {
    glass = Array.prototype.slice.call(document.querySelectorAll(".glass"));
    glass.forEach(function (el) { if (io) io.observe(el); else visible.add(el); });
  }
  var gTick = 0;
  function updateGlow() {
    if (reduce || !bpos.length) return;
    if ((gTick++ % 2) !== 0) return;
    visible.forEach(function (el) {
      var b = el.getBoundingClientRect();
      if (b.width < 2 || b.height < 2) return;
      var best = 0, bx = 0.5, by = 0.5;
      for (var i = 0; i < bpos.length; i++) {
        var o = bpos[i];
        var px = Math.min(Math.max(o.x, b.left), b.right);
        var py = Math.min(Math.max(o.y, b.top), b.bottom);
        var inside = o.x > b.left && o.x < b.right && o.y > b.top && o.y < b.bottom;
        var d;
        if (inside) {
          /* centre is inside: the distance to the nearest edge */
          var dl = o.x - b.left, dr = b.right - o.x, dtp = o.y - b.top, db = b.bottom - o.y;
          var m = Math.min(dl, dr, dtp, db);
          d = m;
          if (m === dl) { px = b.left; py = o.y; } else if (m === dr) { px = b.right; py = o.y; }
          else if (m === dtp) { px = o.x; py = b.top; } else { px = o.x; py = b.bottom; }
          /* a bubble that merely sits under the panel does not light it all round */
          d = d + o.r * 0.25;
        } else {
          d = Math.hypot(o.x - px, o.y - py);
        }
        var s = 1 - d / (o.r * 0.85);
        s = s <= 0 ? 0 : (s > 1 ? 1 : s * s * (3 - 2 * s));
        if (s > best) { best = s; bx = (px - b.left) / b.width; by = (py - b.top) / b.height; }
      }
      el.style.setProperty("--ga", (best * 0.95).toFixed(3));
      el.style.setProperty("--gx", (bx * 100).toFixed(1) + "%");
      el.style.setProperty("--gy", (by * 100).toFixed(1) + "%");
    });
  }

  /* ---------- page helpers ---------- */
  function ready(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  ready(function () {
    resize();
    window.addEventListener("resize", resize);
    if (ctx) { if (reduce) { draw(3); } else requestAnimationFrame(frame); }
    collectGlass();

    var tb = document.getElementById("theme-btn");
    if (tb) tb.addEventListener("click", function () { setTheme(currentTheme() === "light" ? "dark" : "light", true); if (reduce && ctx) draw(3); });
    var mb = document.getElementById("menu-btn"), nav = document.querySelector(".nav");
    /* on a phone the dark / light switch lives inside the opened menu */
    var navul = nav && nav.querySelector("ul");
    if (navul && tb) {
      var li = document.createElement("li"), tb2 = document.createElement("button");
      li.className = "navtheme"; tb2.type = "button"; tb2.className = "themerow";
      tb2.innerHTML = '<svg class="ic moon" aria-hidden="true"><use href="assets/icons.svg#i-moon"/></svg><svg class="ic sun" aria-hidden="true"><use href="assets/icons.svg#i-sun"/></svg><span>Dark / light</span>';
      tb2.addEventListener("click", function () { tb.click(); });
      li.appendChild(tb2); navul.appendChild(li);
      var rowText = function () { tb2.querySelector("span").textContent = tb.getAttribute("title") || "Dark / light"; };
      rowText(); document.addEventListener("i18n", rowText);
    }
    if (mb && nav) mb.addEventListener("click", function () { var o = nav.classList.toggle("open"); mb.setAttribute("aria-expanded", o ? "true" : "false"); });

    /* reveal on scroll */
    var rv = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && !reduce) {
      var ro = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); ro.unobserve(e.target); } }); }, { threshold: 0.08 });
      rv.forEach(function (el) { ro.observe(el); });
    } else rv.forEach(function (el) { el.classList.add("in"); });

    /* live clock in the preview */
    var clk = document.getElementById("mock-time");
    if (clk) {
      var tick = function () { var d = new Date(); clk.textContent = (d.getHours() < 10 ? "0" : "") + d.getHours() + ":" + (d.getMinutes() < 10 ? "0" : "") + d.getMinutes(); };
      tick(); setInterval(tick, 10000);
    }

    /* the preview alternates between a route and the nearby chargers card */
    var scr = document.querySelector(".carscreen .screen");
    if (scr && !reduce) setInterval(function () { scr.classList.toggle("chargers"); }, 5500);

    /* latest version badge, from the public release (shown again after a language change re-creates the badge text) */
    var verText = "";
    function showVersion() {
      if (!verText) return;
      document.querySelectorAll("[data-version]").forEach(function (el) { el.textContent = verText; el.hidden = false; if (el.parentElement) el.parentElement.hidden = false; });
    }
    document.addEventListener("i18n", showVersion);
    if (document.querySelectorAll("[data-version]").length && window.fetch) {
      fetch("https://api.github.com/repos/xiaomi-cockpit/xiaomi-cockpit.github.io/releases/latest", { headers: { Accept: "application/vnd.github+json" } })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) {
          if (!j || !j.tag_name) return;
          var d = j.published_at ? new Date(j.published_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "";
          verText = j.tag_name + (d ? " · " + d : "");
          showVersion();
        }).catch(function () {});
    }

    /* guide: highlight the section being read */
    var toc = document.querySelectorAll(".toc a[href^='#']");
    if (toc.length && "IntersectionObserver" in window) {
      var map = {};
      toc.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
      var so = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting && map[e.target.id]) {
            toc.forEach(function (a) { a.classList.remove("active"); });
            map[e.target.id].classList.add("active");
          }
        });
      }, { rootMargin: "-20% 0px -70% 0px" });
      Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) so.observe(el); });
    }
    var tt = document.getElementById("toc-toggle");
    if (tt) tt.addEventListener("click", function () { document.querySelector(".toc").classList.toggle("collapsed"); });
  });
})();
