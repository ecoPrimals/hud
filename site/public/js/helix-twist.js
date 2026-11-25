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
//
// CROSS-ROTATION (2026-11-25): a layer that carries words is a counter-rotating pair. The frame turns with its
// hand; what is inside the frame is turned the opposite way about the same centre, so the pair is straight:
// the words stay where they were laid out, upright, and can be read and clicked while the frame goes round.
// Drawings (svg, the epitope ring) are one hand only - they turn whole.
//
// KEYS: D turns everything with the clock, A against it. The key of the way it is already going holds it still.
(function () {
  'use strict';
  var PI = Math.PI;
  var TWIST = 45 / PI;           // 14.3239°
  var INVERSE = PI / 45;         // 0.0698 rad = the period
  var CW = 1;                    // clockwise: the clock
  var CCW = -1;                  // counter-clockwise: the counter-clock
  var TURN = 360;                // degrees a second for the outer pair
  var RAD = PI / 180;

  // layers = major visual sections of the HUD, outermost first; each has its own hand.
  //   words: the layer carries text - what is inside is cross-rotated and stays straight
  //   bar:   the frame is a long bar that sweeps the screen - it lets clicks through, its contents take them
  var SELECTORS = [
    { sel: 'header, nav, .hud-nav', name: 'nav', epoch: 10, dir: CW, rate: TURN, words: true, bar: true },
    { sel: '#klein-window-overlay', name: 'klein', epoch: 8, dir: CCW, words: true },
    { sel: '#chipmunk-pane, .chipmunk-talk, [id*="chipmunk"]', name: 'chipmunk', epoch: 8, dir: CW, words: true },
    { sel: '#epitope-ring-svg, .epitope-ring', name: 'epitope', epoch: 6, dir: CCW },
    { sel: 'svg', name: 'svg', epoch: 6, dir: CCW },
    { sel: '.hud-card, .hud-section', name: 'cards', epoch: 5, dir: CW, words: true },
    { sel: '#membrane-svg, .membrane-container, [id*="membrane"]', name: 'membrane', epoch: 4, dir: CCW, words: true },
    { sel: '#null-shadow-indicator', name: 'shadow', epoch: 3, dir: CW, words: true },
    { sel: '.pin, [id*="pi-budget"], [id*="hub-lens"]', name: 'pins', epoch: 2, dir: CCW, words: true },
    { sel: '#iron-peak-heart', name: 'heart', epoch: 1, dir: CW, words: true },
    { sel: 'footer, .hud-footer', name: 'footer', epoch: 0, dir: CCW, rate: TURN, words: true, bar: true }
  ];

  var HAS_ROTATE = typeof document.documentElement.style.rotate === 'string' &&
                   typeof document.documentElement.style.translate === 'string';

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
          name: s.name, elements: els, epoch: s.epoch, dir: s.dir, words: !!s.words, bar: !!s.bar,
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

  // ═══ THE PAIRS ═══
  // For every frame that carries words: which of its children can be held straight, and how far each child's
  // centre lies from the frame's centre in the frame's own (unturned) layout. offset* ignores transforms, so this
  // can be read while everything is turning. It is read once a second, all reads together, never during a frame.
  var pairs = [];                // { frame, kids: [{ el, dx, dy }] }
  var pairsAt = -1e9;

  function measurePairs(layers) {
    var next = [];
    layers.forEach(function (layer) {
      if (!layer.words) return;
      for (var j = 0; j < layer.elements.length; j++) {
        var f = layer.elements[j];
        if (!(f instanceof HTMLElement) || !f.offsetWidth || !f.offsetHeight) continue;   // not drawn: nothing to hold
        var fw = f.offsetWidth, fh = f.offsetHeight, kids = [], loose = false;
        for (var n = f.firstChild; n; n = n.nextSibling) {
          if (n.nodeType === 3 && n.nodeValue.trim()) { loose = true; break; }
        }
        if (loose) continue;          // words written straight into the frame cannot be held apart from it: it turns whole
        for (var c = f.firstElementChild; c; c = c.nextElementSibling) {
          if (!(c instanceof HTMLElement) || c.id === 'helix-indicator') continue;
          if (!c.offsetWidth && !c.offsetHeight) continue;
          if (getComputedStyle(c).position === 'fixed') continue;    // pinned to the frame's turn already: it rides
          var x, y;
          if (c.offsetParent === f) { x = c.offsetLeft + f.clientLeft; y = c.offsetTop + f.clientTop; }
          else if (c.offsetParent === f.offsetParent) { x = c.offsetLeft - f.offsetLeft; y = c.offsetTop - f.offsetTop; }
          else continue;                                             // laid out against something else: it rides the frame
          kids.push({ el: c, dx: x + c.offsetWidth / 2 - fw / 2 - f.scrollLeft, dy: y + c.offsetHeight / 2 - fh / 2 - f.scrollTop });
        }
        if (kids.length) next.push({ frame: f, kids: kids, bar: layer.bar });
      }
    });
    // an inline box cannot be turned at all; as inline-block it can (same place in the line)
    next.forEach(function (p) {
      p.kids.forEach(function (k) {
        if (k.el.dataset.helixHeld) return;
        k.el.dataset.helixHeld = '1';
        if (getComputedStyle(k.el).display === 'inline') { k.el.dataset.helixInline = k.el.style.display || ' '; k.el.style.display = 'inline-block'; }
        if (p.bar) { k.el.dataset.helixPe = k.el.style.pointerEvents || ' '; k.el.style.pointerEvents = 'auto'; }
      });
      if (p.bar && !p.frame.dataset.helixPe) { p.frame.dataset.helixPe = p.frame.style.pointerEvents || ' '; p.frame.style.pointerEvents = 'none'; }
    });
    // a child that is no longer held (removed, hidden, its frame gone) is let go
    var held = [];
    next.forEach(function (p) { p.kids.forEach(function (k) { held.push(k.el); }); });
    pairs.forEach(function (p) { p.kids.forEach(function (k) { if (held.indexOf(k.el) === -1) release(k.el); }); });
    pairs = next;
  }

  function release(el) {
    if (!el.dataset.helixOwn) el.style.rotate = '';
    el.style.translate = '';
    if (el.dataset.helixInline) { el.style.display = el.dataset.helixInline.trim(); delete el.dataset.helixInline; }
    if (el.dataset.helixPe) { el.style.pointerEvents = el.dataset.helixPe.trim(); delete el.dataset.helixPe; }
    delete el.dataset.helixHeld;
  }

  // ═══ APPLY TWIST ═══
  function prepare(el) {
    if (el.dataset.helix) return;
    el.dataset.helix = '1';
    el.dataset.helixOwn = '1';
    el.style.transformOrigin = '50% 50%';
    if (el.ownerSVGElement) el.style.transformBox = 'fill-box';      // a shape inside an svg turns about itself
    if (!HAS_ROTATE) el.dataset.helixBase = el.style.transform || '';  // taken ONCE: the turn is laid over it, never into it
  }

  function setAngle(el, deg) {
    prepare(el);
    if (HAS_ROTATE) {
      // its own property: whatever another script writes into transform (the breath) is left alone
      el.style.rotate = deg === null ? '' : deg.toFixed(2) + 'deg';
    } else {
      el.style.transform = (el.dataset.helixBase || '') + (deg === null ? '' : ' rotate(' + deg.toFixed(2) + 'deg)');
    }
  }

  function applyTwist(layers, tSec) {
    // every hand: direction × pace × seconds
    var own = new Map();
    layers.forEach(function (layer) {
      var angle = (layer.dir * layer.rate * tSec) % 360;
      for (var j = 0; j < layer.elements.length; j++) own.set(layer.elements[j], angle);
    });
    if (!HAS_ROTATE) {             // an old browser has one transform only: the hands turn, nothing is held
      own.forEach(function (angle, el) { setAngle(el, angle); });
      return;
    }
    // every held child: the frame's turn undone about the frame's centre. A turn by -a about a point P is the same
    // as a turn by -a about the child's own centre C followed by a slide of (R(-a) - 1)(C - P); the child's own hand,
    // if it has one, is simply added to the turn.
    var counter = new Map();
    pairs.forEach(function (p) {
      var a = own.get(p.frame);
      if (a === undefined) return;
      var r = -a * RAD, cos = Math.cos(r), sin = Math.sin(r);
      p.kids.forEach(function (k) {
        counter.set(k.el, { turn: -a, tx: k.dx * cos - k.dy * sin - k.dx, ty: k.dx * sin + k.dy * cos - k.dy });
      });
    });
    own.forEach(function (angle, el) {
      prepare(el);
      var c = counter.get(el);
      el.style.rotate = (angle + (c ? c.turn : 0)).toFixed(2) + 'deg';
      if (c) { el.style.translate = c.tx.toFixed(1) + 'px ' + c.ty.toFixed(1) + 'px'; counter.delete(el); }
    });
    counter.forEach(function (c, el) {
      el.style.rotate = c.turn.toFixed(2) + 'deg';
      el.style.translate = c.tx.toFixed(1) + 'px ' + c.ty.toFixed(1) + 'px';
    });
  }

  function holdStill(layers) {
    layers.forEach(function (layer) {
      for (var j = 0; j < layer.elements.length; j++) {
        var f = layer.elements[j];
        setAngle(f, null);
        if (f.dataset.helixPe) { f.style.pointerEvents = f.dataset.helixPe.trim(); delete f.dataset.helixPe; }
      }
    });
    pairs.forEach(function (p) { p.kids.forEach(function (k) { release(k.el); }); });
    pairs = [];
    pairsAt = -1e9;
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
    el.textContent = (still ? '◦ still' : way > 0 ? '⟳ ' + cw + ' · ⟲ ' + ccw : '⟲ ' + cw + ' · ⟳ ' + ccw) +
      ' · ' + layers.length + ' layers' +
      ' · ' + pairs.length + ' pairs straight' +
      ' · ' + bends + ' bends' +
      ' · 45/π=' + TWIST.toFixed(2) + '°' +
      ' · A ⟲ · D ⟳';
  }

  // ═══ THE WAY IT TURNS ═══
  // way: +1 with the clock (D), -1 against it (A), 0 held. The helix has its own seconds: they run forward, run
  // backward or stand, so changing the way never makes a hand jump.
  var way = 1;
  var helixSec = 0;
  var lastT = null;

  function onKey(e) {
    if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
    var t = e.target, tag = t && t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return;
    var k = (e.key || '').toLowerCase();
    if (k !== 'a' && k !== 'd') return;
    var want = k === 'd' ? CW : CCW;
    way = (way === want) ? 0 : want;
    lastShown = -1;                                                  // say so at once
  }

  // ═══ ANIMATE ═══
  var layers = null;
  var indicator = null;
  var lastShown = -1;
  var calm = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var wasStill = false;

  function animate(t) {
    if (!layers) {
      layers = findLayers();
      indicator = createIndicator();
    }
    if (lastT === null) lastT = t;
    helixSec += (t - lastT) * 0.001 * way;
    lastT = t;
    var still = !!(calm && calm.matches);
    if (still) {
      if (!wasStill) holdStill(layers);
    } else {
      if (HAS_ROTATE && t - pairsAt > 1000) { pairsAt = t; measurePairs(layers); }
      applyTwist(layers, helixSec);
    }
    var tick = Math.floor(t / 3000);
    if (indicator && (tick !== lastShown || still !== wasStill)) {
      lastShown = tick;
      updateIndicator(indicator, layers, still || way === 0);
    }
    wasStill = still;
    requestAnimationFrame(animate);
  }

  // ═══ BOOT ═══
  function boot() {
    document.addEventListener('keydown', onKey);
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
    way: function (w) { if (w === CW || w === CCW || w === 0) { way = w; lastShown = -1; } return way; },
    pairs: function () { return pairs.length; },
    refresh: function () { if (layers) holdStill(layers); layers = findLayers(); }
  };
})();
