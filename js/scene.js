/* ==========================================================================
   Hero scene — a wireframe globe in real 3D, drawn on a canvas.
   No libraries: unit-sphere geometry, rotated per frame, projected with a
   simple perspective divide. Reacts to the pointer and to the theme colour.
   Pauses off-screen, on hidden tabs, and for prefers-reduced-motion.
   ========================================================================== */

(function () {
  'use strict';

  var canvas = document.getElementById('hero-canvas');
  var hero = document.getElementById('top');
  if (!canvas || !hero || !canvas.getContext) return;

  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  var MERIDIANS = 12;
  var LAT_STEPS = 26;
  var PARALLELS = 7;
  var LON_STEPS = 40;
  var NODES = 16;

  var meridians = [];
  var parallels = [];
  var nodes = [];

  var W = 0, H = 0, dpr = 1, R = 0, cx = 0, cy = 0;
  var pointerX = 0, pointerY = 0, easedX = 0, easedY = 0;
  var angle = 0, last = 0, raf = null, visible = true;
  var rgb = '94,234,212';

  function vec(phi, lon) {
    return {
      x: Math.cos(phi) * Math.cos(lon),
      y: Math.sin(phi),
      z: Math.cos(phi) * Math.sin(lon)
    };
  }

  function build() {
    var i, m, lon, phi, arr;

    for (m = 0; m < MERIDIANS; m++) {
      lon = (m / MERIDIANS) * Math.PI * 2;
      arr = [];
      for (i = 0; i <= LAT_STEPS; i++) {
        phi = -Math.PI / 2 + (i / LAT_STEPS) * Math.PI;
        arr.push(vec(phi, lon));
      }
      meridians.push(arr);
    }

    for (m = 1; m < PARALLELS; m++) {
      phi = -Math.PI / 2 + (m / PARALLELS) * Math.PI;
      arr = [];
      for (i = 0; i <= LON_STEPS; i++) {
        lon = (i / LON_STEPS) * Math.PI * 2;
        arr.push(vec(phi, lon));
      }
      parallels.push(arr);
    }

    for (i = 0; i < NODES; i++) {
      nodes.push(vec(Math.random() * Math.PI - Math.PI / 2, Math.random() * Math.PI * 2));
    }
  }

  function readAccent() {
    var value = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    var hex = /^#([0-9a-f]{6})$/i.exec(value);
    if (hex) {
      var n = parseInt(hex[1], 16);
      rgb = (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255);
    }
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    var rect = hero.getBoundingClientRect();
    W = Math.max(1, Math.round(rect.width));
    H = Math.max(1, Math.round(rect.height));

    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var narrow = W < 900;
    R = narrow ? Math.min(W, H) * 0.5 : Math.min(W * 0.27, H * 0.62);
    cx = narrow ? W * 0.5 : W * 0.7;
    cy = narrow ? H * 0.58 : H * 0.5;
  }

  function render() {
    var rx = -0.3 + easedY * 0.3;
    var ry = angle + easedX * 0.55;
    var cosY = Math.cos(ry), sinY = Math.sin(ry);
    var cosX = Math.cos(rx), sinX = Math.sin(rx);
    var fov = 2.6;

    ctx.clearRect(0, 0, W, H);

    function project(v) {
      var x1 = v.x * cosY - v.z * sinY;
      var z1 = v.x * sinY + v.z * cosY;
      var y1 = v.y * cosX - z1 * sinX;
      var z2 = v.y * sinX + z1 * cosX;
      var s = fov / (fov + z2);
      return { x: cx + x1 * R * s, y: cy + y1 * R * s, d: (z2 + 1) / 2 };
    }

    /* Collect every segment into four depth buckets, so each bucket is one
       stroke() call instead of one per segment. */
    var buckets = [[], [], [], []];

    function collect(curve) {
      var prev = project(curve[0]);
      for (var i = 1; i < curve.length; i++) {
        var cur = project(curve[i]);
        var b = Math.floor(((prev.d + cur.d) / 2) * 4);
        if (b > 3) b = 3;
        if (b < 0) b = 0;
        buckets[b].push(prev, cur);
        prev = cur;
      }
    }

    for (var i = 0; i < meridians.length; i++) collect(meridians[i]);
    for (var j = 0; j < parallels.length; j++) collect(parallels[j]);

    var alpha = [0.3, 0.2, 0.12, 0.06];
    ctx.lineWidth = 1;

    for (var b = 0; b < 4; b++) {
      var segs = buckets[b];
      if (!segs.length) continue;
      ctx.beginPath();
      for (var k = 0; k < segs.length; k += 2) {
        ctx.moveTo(segs[k].x, segs[k].y);
        ctx.lineTo(segs[k + 1].x, segs[k + 1].y);
      }
      ctx.strokeStyle = 'rgba(' + rgb + ',' + alpha[b] + ')';
      ctx.stroke();
    }

    for (var n = 0; n < nodes.length; n++) {
      var p = project(nodes[n]);
      var a = Math.max(0.08, 0.8 - p.d * 0.6);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.7 - p.d * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + rgb + ',' + a + ')';
      ctx.fill();
    }
  }

  function loop(ts) {
    raf = requestAnimationFrame(loop);

    var dt = last ? Math.min(ts - last, 64) : 16;
    last = ts;

    angle += dt * 0.00016;
    easedX += (pointerX - easedX) * 0.06;
    easedY += (pointerY - easedY) * 0.06;

    render();
  }

  function play() {
    if (reduceMotion) { render(); return; }
    if (raf === null) {
      last = 0;
      raf = requestAnimationFrame(loop);
    }
  }

  function pause() {
    if (raf !== null) {
      cancelAnimationFrame(raf);
      raf = null;
    }
  }

  /* ---------- Pointer: globe parallax + terminal tilt -------------------- */

  var term = document.querySelector('.hero .term');

  function tilt(x, y) {
    if (!term) return;
    term.style.transform =
      'perspective(1000px) rotateX(' + (-y * 3).toFixed(2) + 'deg) ' +
      'rotateY(' + (x * 3.5).toFixed(2) + 'deg)';
  }

  if (finePointer && !reduceMotion) {
    hero.addEventListener('pointermove', function (event) {
      var rect = hero.getBoundingClientRect();
      pointerX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerY = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      tilt(pointerX, pointerY);
    });

    hero.addEventListener('pointerleave', function () {
      pointerX = 0;
      pointerY = 0;
      if (term) term.style.transform = '';
    });
  }

  /* ---------- Lifecycle --------------------------------------------------- */

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) play(); else pause();
    }, { threshold: 0 }).observe(hero);
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) pause();
    else if (visible) play();
  });

  var resizeTimer = null;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resize();
      if (reduceMotion) render();
    }, 120);
  }

  window.addEventListener('resize', onResize);
  if ('ResizeObserver' in window) {
    new ResizeObserver(onResize).observe(hero);
  }

  if ('MutationObserver' in window) {
    new MutationObserver(function () {
      readAccent();
      if (reduceMotion) render();
    }).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  }

  build();
  readAccent();
  resize();
  play();
})();
