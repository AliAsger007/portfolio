/* ==========================================================================
   Ali Asger — portfolio behaviour (v2)
   Theme, mobile menu, reveals, active nav, and one shortcut.
   No dependencies. Everything degrades gracefully.
   ========================================================================== */

(function () {
  'use strict';

  var root = document.documentElement;
  var themeBtn = document.getElementById('theme-btn');
  var menuBtn = document.getElementById('menu-btn');
  var nav = document.getElementById('site-nav');
  var header = document.getElementById('site-head');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme ------------------------------------------------------ */

  function applyTheme(theme) {
    var isDark = theme !== 'light';
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    if (themeBtn) {
      var label = isDark ? 'Switch to light theme' : 'Switch to dark theme';
      themeBtn.setAttribute('aria-label', label);
      themeBtn.setAttribute('title', label + ' (T)');
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', isDark ? '#07080a' : '#f4f6f7');
  }

  applyTheme(root.getAttribute('data-theme') || 'dark');

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem('theme', next); } catch (e) { /* private mode */ }
    });

    /* Press T anywhere (outside a field) to flip the theme. */
    document.addEventListener('keydown', function (event) {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      var el = event.target;
      var tag = el && el.tagName ? el.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (el && el.isContentEditable) return;
      if (event.key === 't' || event.key === 'T') {
        event.preventDefault();
        themeBtn.click();
      }
    });
  }

  /* ---------- Mobile menu ------------------------------------------------ */

  if (menuBtn && nav) {
    var closeMenu = function () {
      nav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.setAttribute('aria-label', 'Open menu');
    };

    menuBtn.addEventListener('click', function () {
      if (nav.classList.contains('open')) {
        closeMenu();
      } else {
        nav.classList.add('open');
        menuBtn.setAttribute('aria-expanded', 'true');
        menuBtn.setAttribute('aria-label', 'Close menu');
      }
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 760) closeMenu();
    });
  }

  /* ---------- Header state ---------------------------------------------- */

  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 8);
  }

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  /* ---------- Scroll reveals -------------------------------------------- */

  var reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(reveals, function (el) { revealObserver.observe(el); });
  } else {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add('in'); });
  }

  /* ---------- Active nav link ------------------------------------------- */

  var links = Array.prototype.slice.call(document.querySelectorAll('.nav a'));
  var sections = links
    .map(function (link) {
      var id = link.getAttribute('href');
      return id && id.charAt(0) === '#' ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) {
          var match = link.getAttribute('href') === '#' + entry.target.id;
          link.classList.toggle('active', match);
          if (match) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-42% 0px -52% 0px', threshold: 0 });

    sections.forEach(function (section) { spy.observe(section); });
  }

  /* ---------- Footer year ----------------------------------------------- */

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
