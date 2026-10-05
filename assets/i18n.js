/* Xiaomi Cockpit website: languages. The pages are written in English. Every block of text (a paragraph, a list item, a heading, a table cell,
   a button ...) is looked up by its English HTML in assets/i18n/<language>.json and replaced; what is not found stays English.
   The language comes from ?lang=xx, then the visitor's choice (remembered), then the browser's language. */
(function () {
  "use strict";
  var LANGS = [["en", "English", "EN"], ["km", "ខ្មែរ", "KH"], ["ru", "Русский", "RU"], ["pl", "Polski", "PL"]];
  var KEY = "cockpit-lang";
  var SKIP = { script: 1, style: 1, svg: 1, canvas: 1, code: 1, pre: 1, noscript: 1, select: 1, option: 1 };
  var INLINE = { a: 1, b: 1, i: 1, em: 1, strong: 1, span: 1, small: 1, br: 1, svg: 1, use: 1, path: 1, sub: 1, sup: 1, kbd: 1, mark: 1, code: 1, img: 1 };
  var root = document.documentElement;

  function norm(s) { return s.replace(/\s+/g, " ").trim(); }
  function tag(n) { return n.tagName.toLowerCase(); }
  function hasText(n) { return norm(n.textContent || "") !== ""; }
  /* an icon (svg, or an element that only holds an svg) is kept as it is when the text is replaced */
  function isDeco(n) { return n.nodeType === 1 && (tag(n) === "svg" || (n.querySelector("svg") && !hasText(n))); }
  function inlineOnly(el) {
    for (var c = el.firstElementChild; c; c = c.nextElementSibling) {
      if (!INLINE[tag(c)]) return false;
      if (!inlineOnly(c)) return false;
    }
    return true;
  }

  var units = [];      /* { el, key, deco: [nodes] } */
  var attrs = [];      /* { el, name, key } */
  var mixed = [];
  function onlyLinks(el) {
    if (!el.children.length) return false;
    for (var c = el.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 3 && norm(c.nodeValue)) return false;
      if (c.nodeType === 1 && tag(c) !== "a") return false;
    }
    return true;
  }
  /* an icon inside a text becomes a token, so the keys stay readable */
  function tokens(html) { return html.replace(/<svg\b[\s\S]*?<\/svg>/g, function (m) { var id = /#([\w-]+)/.exec(m); return "{{ic:" + (id ? id[1] : "x") + "}}"; }); }
  function untokens(html) { return html.replace(/\{\{ic:([\w-]+)\}\}/g, '<svg class="ic" aria-hidden="true"><use href="assets/icons.svg#$1"></use></svg>'); }
  function walk(el) {
    if (SKIP[tag(el)] || el.getAttribute("translate") === "no" || el.getAttribute("aria-hidden") === "true") return;
    var boundary = !el.matches(".btn, .chip") && (el.querySelector(".btn, .chip") || onlyLinks(el));
    if (!boundary && hasText(el) && inlineOnly(el)) {
      var clone = el.cloneNode(true), deco = [], n;
      for (n = el.firstChild; n; n = n.nextSibling) if (isDeco(n)) deco.push(n);
      for (n = clone.firstChild; n;) { var nx = n.nextSibling; if (isDeco(n)) clone.removeChild(n); n = nx; }
      var key = norm(tokens(clone.innerHTML));
      if (key) units.push({ el: el, key: key, deco: deco });
      return;
    }
    for (var c = el.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 3 && norm(c.nodeValue) && el.children.length) mixed.push(norm(c.nodeValue));
    }
    for (var e = el.firstElementChild; e; e = e.nextElementSibling) walk(e);
  }
  function collect() {
    walk(document.body);
    var els = document.querySelectorAll("[title],[aria-label],img[alt]");
    for (var i = 0; i < els.length; i++) {
      ["title", "aria-label", "alt"].forEach(function (a) {
        var v = els[i].getAttribute(a);
        if (v && norm(v) && !els[i].closest('[translate="no"]')) attrs.push({ el: els[i], name: a, key: norm(v) });
      });
    }
  }

  var metas = [];
  function collectHead() {
    metas.push({ key: document.title, set: function (v) { document.title = v; } });
    ["meta[name=description]", "meta[property='og:title']", "meta[property='og:description']"].forEach(function (sel) {
      var m = document.querySelector(sel);
      if (m && m.getAttribute("content")) metas.push({ key: m.getAttribute("content"), set: function (v) { m.setAttribute("content", v); } });
    });
  }

  function setUnit(u, html) {
    var el = u.el, n;
    for (n = el.firstChild; n;) { var nx = n.nextSibling; if (u.deco.indexOf(n) < 0) el.removeChild(n); n = nx; }
    el.insertAdjacentHTML("beforeend", untokens(html));
  }

  var dicts = {};
  function apply(lang) {
    var d = dicts[lang] || {};
    units.forEach(function (u) { setUnit(u, d[u.key] || u.key); });
    attrs.forEach(function (a) { a.el.setAttribute(a.name, d[a.key] || a.key); });
    metas.forEach(function (m) { m.set(d[m.key] || m.key); });
    root.setAttribute("lang", lang);
    document.dispatchEvent(new Event("i18n"));
    root.classList.toggle("lang-km", lang === "km");
    var sel = document.getElementById("lang-select");
    if (sel) sel.value = lang;
  }
  function load(lang, done) {
    if (lang === "en" || dicts[lang]) { done(); return; }
    var x = new XMLHttpRequest();
    x.open("GET", "/assets/i18n/" + lang + ".json");
    x.onload = function () { try { dicts[lang] = JSON.parse(x.responseText); } catch (e) { dicts[lang] = {}; } done(); };
    x.onerror = function () { dicts[lang] = {}; done(); };
    x.send();
  }
  function setLang(lang, save) {
    if (save) { try { localStorage.setItem(KEY, lang); } catch (e) {} }
    load(lang, function () { apply(lang); });
  }

  function pick() {
    var q = /[?&]lang=(en|km|ru|pl)\b/.exec(location.search);
    if (q) return q[1];
    var s = null;
    try { s = localStorage.getItem(KEY); } catch (e) {}
    if (s && LANGS.some(function (l) { return l[0] === s; })) return s;
    var nl = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || "en"]);
    for (var i = 0; i < nl.length; i++) {
      var c = String(nl[i]).toLowerCase().slice(0, 2);
      if (c === "km" || c === "ru" || c === "pl") return c;
      if (c === "en") return "en";
    }
    return "en";
  }

  function addSwitcher() {
    var nav = document.querySelector(".nav");
    var tb = document.getElementById("theme-btn");
    if (!nav) return;
    var sel = document.createElement("select");
    sel.id = "lang-select";
    sel.className = "langsel";
    sel.setAttribute("aria-label", "Language");
    var narrow = window.matchMedia ? window.matchMedia("(max-width: 760px)") : null;
    /* on a phone the menu shows two-letter codes so the header stays on one line */
    function names() { Array.prototype.forEach.call(sel.options, function (o, i) { o.textContent = narrow && narrow.matches ? LANGS[i][2] : LANGS[i][1]; }); }
    LANGS.forEach(function (l) { var o = document.createElement("option"); o.value = l[0]; sel.appendChild(o); });
    names();
    if (narrow && narrow.addEventListener) narrow.addEventListener("change", names);
    sel.addEventListener("change", function () { setLang(sel.value, true); });
    nav.insertBefore(sel, tb || null);
  }

  function init() {
    collect();
    collectHead();
    /* the English texts of the head, the attributes and the blocks are the keys */
    addSwitcher();
    if (/[?&]dumpkeys=1/.test(location.search)) {
      var out = { units: units.map(function (u) { return u.key; }), attrs: attrs.map(function (a) { return a.key; }), metas: metas.map(function (m) { return m.key; }), mixed: mixed };
      var pre = document.createElement("pre");
      pre.id = "i18n-keys";
      pre.textContent = JSON.stringify(out);
      document.body.appendChild(pre);
      return;
    }
    setLang(pick(), false);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
