// helix-twist.js — every layer turns like the hand of a clock; neighbouring layers turn opposite ways.
// Counter-rotating pairs stay straight. Same-direction pairs bend.
// The organism is a HELIX with 45/π twist per layer.
//
// 45/π ≈ 14.3239° — the squirrel's observation angle.
// π/45 ≈ 0.0698 rad ≈ 4° — the inverse period.
//
// The turn is kept by the CLOCK, not by the frame: an angle is worked out from the time that has passed, so it is
// the same turn on a 60 Hz screen and a 144 Hz one, and it never adds itself to itself.
//   outer pair  — nav clockwise, footer counter-clockwise: one full turn a second
//   inner layers — epoch × 45/π degrees a second, alternating clockwise / counter-clockwise
// No hand turns faster than one turn a second (a layer riding inside another shows the sum of the two), and a
// visitor who asks for reduced motion gets none.
(function () {
  'use strict';
  var PI = Math.PI;
  var TWIST = 45 / PI;           // 14.3239°
  var INVERSE = PI / 45;         // 0.0698 rad = the period
  var CW = 1;                    // clockwise: the clock
  var CCW = -1;                  // counter-clockwise: the counter-clock
  var TURN = 360;                // degrees a second for the outer pair

  // layers = major visual sections of the HUD, outermost first; each has its own hand
  var SELECTORS = [
    { sel: 'header, nav, .hud-nav', name: 'nav', epoch: 10, dir: CW, rate: TURN },
    { sel: '#klein-window-overlay', name: 'klein', epoch: 8, dir: CCW },
    { sel: '#chipmunk-pane, .chipmunk-talk, [id*="chipmunk"]', name: 'chipmunk', epoch: 8, dir: CW },
    { sel: '#epitope-ring-svg, .epitope-ring', name: 'epitope', epoch: 6, dir: CCW },
    { sel: 'svg', name: 'svg', epoch: 6, dir: CCW },
    { sel: '.hud-card, .hud-section', name: 'cards', epoch: 5, dir: CW },
    { sel: '#membrane-svg, .membrane-container, [id*="membrane"]', name: 'membrane', epoch: 4, dir: CCW },
    { sel: '#null-shadow-indicator', name: 'shadow', epoch: 3, dir: CW },
    { sel: '.pin, [id*="pi-budget"], [id*="hub-lens"]', name: 'pins', epoch: 2, dir: CCW },
    { sel: '#iron-peak-heart', name: 'heart', epoch: 1, dir: CW },
    { sel: 'footer, .hud-footer', name: 'footer', epoch: 0, dir: CCW, rate: TURN }
  ];

  var HAS_ROTATE = typeof document.documentElement.style.rotate === 'string';

  // ═══ FIND ALL LAYERS ═══
  function findLayers() {
    var layers = [];
    var claimed = [];
    SELECTORS.forEach(function (s) {
      var found = document.querySelectorAll(s.sel);
      var els = [];
      for (var j = 0; j < found.length; j++) {
        var el = found[j];
        if (el.id === 'helix-indicator' || claimed.indexOf(el) !== -1) continue;   // one hand per element
        // an element inside another of the same layer rides its parent's turn; turning it again would double it
        if (el.parentElement && el.parentElement.closest(s.sel)) continue;
        claimed.push(el);
        els.push(el);
      }
      if (els.length > 0) {
        layers.push({
          name: s.name, elements: els, epoch: s.epoch, dir: s.dir,
          rate: (s.rate !== undefined) ? s.rate : s.epoch * TWIST      // degrees a second
        });
      }
    });

    // sort by epoch (pi-sorted)
    layers.sort(function (a, b) {
      var aPi = (a.epoch * TWIST) % 360;
      var bPi = (b.epoch * TWIST) % 360;
      return aPi - bPi;
    });

    return layers;
  }

  // ═══ APPLY TWIST ═══
  function setAngle(el, deg) {
    if (!el.dataset.helix) {
      el.dataset.helix = '1';
      el.style.transformOrigin = '50% 50%';
      if (el.ownerSVGElement) el.style.transformBox = 'fill-box';      // a shape inside an svg turns about itself
      if (!HAS_ROTATE) el.dataset.helixBase = el.style.transform || '';  // taken ONCE: the turn is laid over it, never into it
    }
    if (HAS_ROTATE) {
      // its own property: whatever another script writes into transform (the breath) is left alone
      el.style.rotate = deg === null ? '' : deg.toFixed(2) + 'deg';
    } else {
      el.style.transform = (el.dataset.helixBase || '') + (deg === null ? '' : ' rotate(' + deg.toFixed(2) + 'deg)');
    }
  }

  function applyTwist(layers, tSec) {
    layers.forEach(function (layer) {
      // the angle comes from the clock: direction × pace × seconds
      var angle = (layer.dir * layer.rate * tSec) % 360;
      for (var j = 0; j < layer.elements.length; j++) {
        setAngle(layer.elements[j], angle);
      }
    });
  }

  function holdStill(layers) {
    layers.forEach(function (layer) {
      for (var j = 0; j < layer.elements.length; j++) {
        setAngle(layer.elements[j], null);
      }
    });
  }

  // ═══ HELIX INDICATOR ═══
  function createIndicator() {
    var el = document.getElementById('helix-indicator');
    if (el) return el;

    el = document.createElement('div');
    el.id = 'helix-indicator';
    el.style.cssText = 'position:fixed;top:12px;left:12px;z-index:9999;' +
      'font:8px SF Mono,monospace;color:#484f58;pointer-events:none;opacity:0.5';
    document.body.appendChild(el);
    return el;
  }

  function updateIndicator(el, layers, still) {
    var cw = 0, ccw = 0, bends = 0;
    for (var i = 0; i < layers.length; i++) {
      if (layers[i].dir === CW) cw++; else ccw++;
      if (i > 0 && layers[i].dir === layers[i - 1].dir) bends++;
    }
    el.textContent = (still ? '◦ still' : '⟳ ' + cw + ' · ⟲ ' + ccw) +
      ' · ' + layers.length + ' layers' +
      ' · ' + bends + ' bends' +
      ' · 45/π=' + TWIST.toFixed(2) + '°';
  }

  // ═══ ANIMATE ═══
  var layers = null;
  var indicator = null;
  var t0 = null;
  var lastShown = -1;
  var calm = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var wasStill = false;

  function animate(t) {
    if (!layers) {
      layers = findLayers();
      indicator = createIndicator();
    }
    if (t0 === null) t0 = t;
    var still = !!(calm && calm.matches);
    if (still) {
      if (!wasStill) holdStill(layers);
    } else {
      applyTwist(layers, (t - t0) * 0.001);
    }
    var tick = Math.floor(t / 3000);
    if (indicator && (tick !== lastShown || still !== wasStill)) {
      lastShown = tick;
      updateIndicator(indicator, layers, still);
    }
    wasStill = still;
    requestAnimationFrame(animate);
  }

  // ═══ BOOT ═══
  function boot() {
    // delay to let other scripts render first
    setTimeout(function () {
      requestAnimationFrame(animate);
    }, 2000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window._helixTwist = {
    TWIST: TWIST,
    INVERSE: INVERSE,
    TURN: TURN,
    findLayers: findLayers,
    refresh: function () { if (layers) holdStill(layers); layers = findLayers(); }
  };
})();
