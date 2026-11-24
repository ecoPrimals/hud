// wave259-overlay.js v4 — THE GLASS · THE WATCHTOWER · ORIGIN
// ALL IO on ONE surface. Klein dissolution. VISIBLE.
(function() {
  'use strict';

  function build() {
    if (document.getElementById('w259')) document.getElementById('w259').remove();

    var wrap = document.createElement('div');
    wrap.id = 'w259';
    wrap.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:9999;overflow:hidden;font-family:monospace;';
    document.body.appendChild(wrap);

    var style = document.createElement('style');
    style.textContent = [
      '@keyframes w259p{0%,100%{opacity:0.5;transform:translate(-50%,-50%) scale(1)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.5)}}',
      '@keyframes w259b{0%,100%{opacity:0.3}50%{opacity:0.8}}',
      '@keyframes w259spin{from{transform:translate(-50%,-50%) rotate(0deg)}to{transform:translate(-50%,-50%) rotate(360deg)}}',
      '#w259 .dot{position:absolute;border-radius:50%;transform:translate(-50%,-50%)}',
      '#w259 .ring{position:absolute;border-radius:50%;transform:translate(-50%,-50%);background:transparent}',
      '#w259 .lbl{position:absolute;transform:translate(-50%,0);white-space:nowrap;text-shadow:0 0 4px #000,0 0 8px #000}',
      '#w259 .stat{position:absolute;white-space:nowrap;text-shadow:0 0 6px #000,0 0 12px #000}',
      '#w259 .panel{position:absolute;background:rgba(0,0,0,0.6);border:1px solid rgba(255,255,255,0.08);border-radius:4px;padding:4px 8px}',
      '@keyframes w259breathe{0%,100%{transform:translate(-50%,-50%) scale(1);opacity:0.15}50%{transform:translate(-50%,-50%) scale(1.08);opacity:0.25}}',
    ].join('\n');
    document.head.appendChild(style);


    function line(x1, y1, x2, y2, c, o, w) {
      var d = document.createElement('div');
      var dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx*dx + dy*dy);
      d.style.cssText = 'position:absolute;left:'+x1+'px;top:'+y1+'px;width:'+len+'px;height:'+(w||1)+'px;background:'+c+';opacity:'+(o||0.15)+';transform-origin:0 0;transform:rotate('+Math.atan2(dy,dx)*180/Math.PI+'deg);';
      wrap.appendChild(d); return d;
    }

    var vw = window.innerWidth, vh = window.innerHeight;
    var cx = vw / 2, cy = vh / 2;
    var R = Math.min(vw, vh) * 0.38;

    function dot(x, y, r, c, o, pulse) {
      var d = document.createElement('div');
      d.className = 'dot';
      d.style.cssText = 'left:'+x+'px;top:'+y+'px;width:'+(r*2)+'px;height:'+(r*2)+'px;background:'+c+';opacity:'+o+';box-shadow:0 0 '+(r*2)+'px '+c+';';
      if (pulse) d.style.animation = 'w259p '+(1.5+Math.random()*2)+'s ease-in-out infinite';
      wrap.appendChild(d); return d;
    }
    function ring(x, y, r, c, o, spin) {
      var d = document.createElement('div');
      d.className = 'ring';
      d.style.cssText = 'left:'+x+'px;top:'+y+'px;width:'+(r*2)+'px;height:'+(r*2)+'px;border:1px solid '+c+';opacity:'+o+';';
      if (spin) d.style.animation = 'w259spin '+spin+'s linear infinite';
      wrap.appendChild(d); return d;
    }
    function lbl(x, y, t, c, s, o) {
      var l = document.createElement('div');
      l.className = 'lbl';
      l.style.cssText = 'left:'+x+'px;top:'+y+'px;color:'+c+';font-size:'+s+'px;opacity:'+o+';';
      l.textContent = t;
      wrap.appendChild(l); return l;
    }
    function panel(x, y, html, anchor) {
      var p = document.createElement('div');
      p.className = 'panel';
      var ax = anchor === 'right' ? 'right:'+x+'px;' : 'left:'+x+'px;';
      var ay = anchor === 'bottom' ? 'bottom:'+y+'px;' : 'top:'+y+'px;';
      p.style.cssText = ax + ay + 'color:#c8c8c8;font-size:10px;line-height:1.6;';
      p.innerHTML = html;
      wrap.appendChild(p); return p;
    }

    // ═══ DEPTH RINGS (ouroboros skeleton — visible!) ═══
    var depthColors = ['#1a2a40','#1e3048','#223650','#263c58','#2a4260','#2e4868','#324e70','#366078'];
    for (var i = 0; i < 8; i++) {
      var rr = R * (0.3 + i * 0.1);
      ring(cx, cy, rr, depthColors[i] || '#2a4060', 0.25);
    }

    // ═══ KLEIN BOTTLE (counter-rotating rings) ═══
    ring(cx, cy, R * 0.98, '#3a5070', 0.15, 180);
    ring(cx, cy, R * 0.25, '#d4a574', 0.15, -60);
    // Breathing ring (lung)
    var breathRing = document.createElement('div');
    breathRing.className = 'ring';
    breathRing.style.cssText = 'left:'+cx+'px;top:'+cy+'px;width:'+(R*0.6)+'px;height:'+(R*0.6)+'px;border:1px solid #d4a574;animation:w259breathe 4s ease-in-out infinite;';
    wrap.appendChild(breathRing);

    // ═══ GUT RING (blackholes orbit here) ═══
    var gutR = R * 0.65;
    ring(cx, cy, gutR, '#f0883e', 0.12, 120);

    // ═══ MEMBRANE RING (gates orbit here) ═══
    var memR = R * 0.5;
    ring(cx, cy, memR, '#3fb950', 0.12, 90);

    // ═══ LEFT PANEL — status ═══
    var leftLines = [];

    // ═══ SEED DATA ═══
    fetch('/gaia-seed.json').then(function(r){return r.json()}).then(function(seed) {
      var pins = Object.keys(seed.io_pin_map || {}).length;
      var levels = seed.depth_levels || [];
      var el = document.getElementById('w259-left');
      if (el) el.innerHTML = '<span style="color:#f0883e">▲</span> wave ' + seed.wave + ' · ' + pins + ' pins · ' + levels.length + ' depth<br>' + el.innerHTML;
    }).catch(function(){});

    // ═══ BLACKHOLES ═══
    fetch('/data/blackhole-axis-259.json').then(function(r){return r.json()}).then(function(axis) {
      var holes = axis.blackholes || [];
      var bhCoords = [];
      holes.forEach(function(h, i) {
        var a = -Math.PI/2 + (i / (holes.length - 1 || 1)) * Math.PI * 2;
        var hx = cx + Math.cos(a) * gutR;
        var hy = cy + Math.sin(a) * gutR;
        var active = h.state === 'ACTIVE';
        var c = active ? '#f0883e' : '#555';
        dot(hx, hy, active ? 4 : 2, c, active ? 0.7 : 0.2, active);
        if (active && vw > 400) lbl(hx, hy + 8, h.name.replace(/-blackhole$/,''), '#f0883e', 7, 0.5);
        bhCoords.push({x:hx, y:hy, active:active});
      });
      // LINES — connect consecutive blackholes around the gut ring
      for (var bi = 0; bi < bhCoords.length; bi++) {
        var next = bhCoords[(bi + 1) % bhCoords.length];
        var cur = bhCoords[bi];
        var lineColor = (cur.active && next.active) ? '#f0883e' : '#333';
        var lineOp = (cur.active && next.active) ? 0.15 : 0.04;
        line(cur.x, cur.y, next.x, next.y, lineColor, lineOp, 1);
      }
      // Lines from blackholes to center (intake → gut)
      bhCoords.forEach(function(bh) {
        if (bh.active) line(bh.x, bh.y, cx, cy, '#f0883e', 0.04, 1);
      });
      var el = document.getElementById('w259-left');
      if (el) el.innerHTML += '<span style="color:#f0883e">◉</span> ' + axis.state_summary.active + '/' + axis.state_summary.total + ' blackholes · gut<br>';
    }).catch(function(){});

    // ═══ GATES ═══
    fetch('/data/organism-census.json').then(function(r){return r.json()}).then(function(census) {
      var gates = census.gates || {};
      var keys = Object.keys(gates);
      var aliveCount = 0;
      var gateCoords = [];
      keys.forEach(function(name, i) {
        var g = gates[name];
        var a = (i / keys.length) * Math.PI * 2 - Math.PI / 2;
        var gx = cx + Math.cos(a) * memR;
        var gy = cy + Math.sin(a) * memR;
        var alive = g.status === 'ALIVE';
        if (alive) aliveCount++;
        dot(gx, gy, alive ? 4 : 3, alive ? '#3fb950' : '#f85149', alive ? 0.8 : 0.3, alive);
        lbl(gx, gy + 8, name, alive ? '#3fb950' : '#f85149', 7, 0.6);
        gateCoords.push({x:gx, y:gy, alive:alive, name:name});
      });
      // LINES — connect gates around the membrane ring
      for (var gi = 0; gi < gateCoords.length; gi++) {
        var gnext = gateCoords[(gi + 1) % gateCoords.length];
        var gcur = gateCoords[gi];
        var gLineColor = (gcur.alive && gnext.alive) ? '#3fb950' : '#f85149';
        var gLineOp = (gcur.alive && gnext.alive) ? 0.12 : 0.03;
        line(gcur.x, gcur.y, gnext.x, gnext.y, gLineColor, gLineOp, 1);
      }
      // Lines from alive gates to center (membrane → heart)
      gateCoords.forEach(function(gc) {
        if (gc.alive) line(gc.x, gc.y, cx, cy, '#3fb950', 0.03, 1);
      });
      var el = document.getElementById('w259-left');
      if (el) el.innerHTML += '<span style="color:#3fb950">●</span> ' + aliveCount + '/' + keys.length + ' gates · membrane<br>';
    }).catch(function(){});

    // ═══ KLEIN FACES (crossing markers) ═══
    fetch('/data/klein-faces-259.json').then(function(r){return r.json()}).then(function(kf) {
      var outX = cx + R * 0.8, outY = cy - R * 0.6;
      dot(outX, outY, 6, '#f0e68c', 0.6, true);
      lbl(outX, outY + 10, 'out · SUN→IN', '#f0e68c', 8, 0.7);

      var inX = cx - R * 0.8, inY = cy + R * 0.6;
      dot(inX, inY, 6, '#5aad72', 0.6, true);
      lbl(inX, inY + 10, 'in · CELL→OUT', '#5aad72', 8, 0.7);

      // fold line
      var d = document.createElement('div');
      var dx = outX - inX, dy = outY - inY, len = Math.sqrt(dx*dx + dy*dy);
      d.style.cssText = 'position:absolute;left:'+inX+'px;top:'+inY+'px;width:'+len+'px;height:1px;background:linear-gradient(90deg,#5aad72 0%,transparent 40%,transparent 60%,#f0e68c 100%);opacity:0.15;transform-origin:0 0;transform:rotate('+Math.atan2(dy,dx)*180/Math.PI+'deg);';
      wrap.appendChild(d);

      // fold point
      dot(cx, cy, 3, '#fff', 0.3, true);
      lbl(cx, cy + 8, '∅ fold', '#aaa', 7, 0.4);
    }).catch(function(){});

    // ═══ LEFT STATUS PANEL ═══
    var leftPanel = panel(6, 0, '', 'bottom');
    leftPanel.id = 'w259-left';
    leftPanel.style.bottom = '52px';
    leftPanel.style.maxWidth = (vw * 0.45) + 'px';

    // ═══ RIGHT INVENTORY PANEL ═══
    var rightPanel = panel(6, 6, '<span style="color:#888">loading...</span>', 'right');
    rightPanel.id = 'w259-right';
    rightPanel.style.maxWidth = (vw * 0.45) + 'px';

    // ═══ DOCK (inventory) ═══
    fetch('/data/space-dock-259.json').then(function(r){return r.json()}).then(function(dock) {
      var inv = dock.INVENTORY || {};
      var el = document.getElementById('w259-right');
      if (el) el.innerHTML = '<span style="color:#d4a574">⬡</span> ' + inv.html_pages + ' pages · ' + inv.js_instruments + ' JS<br>' +
        '<span style="color:#d4a574">⬡</span> ' + inv.data_bones + ' bones · ' + inv.walker_rooms + ' rooms<br>' +
        '<span style="color:#d4a574">⬡</span> ' + inv.hub_genres + ' genres · ' + inv.rss_items + ' RSS';
    }).catch(function(){});

    // ═══ RSS ═══
    fetch('/feed.xml').then(function(r){return r.text()}).then(function(xml) {
      var items = (xml.match(/<item>/g) || []).length;
      var el = document.getElementById('w259-right');
      if (el) el.innerHTML += '<br><span style="color:#f0883e">📡</span> ' + items + ' items fermenting';
    }).catch(function(){});

    // ═══ HEARTBEAT ═══
    // ═══ HUD·HUB·BUB THREE-BEAT BRAND ═══
    var brandWrap = document.createElement('div');
    brandWrap.style.cssText = 'position:absolute;left:8px;bottom:36px;font-size:11px;opacity:0.5;display:flex;gap:2px;';
    
    var beats = [
      {text:'HUD', color:'#5aad72', delay:'0s'},
      {text:'HUB', color:'#f0883e', delay:'0.3s'},
      {text:'BUB', color:'#d4a574', delay:'0.6s'}
    ];
    var organs = ['👂 ear','👄 mouth','🫁 lung'];
    beats.forEach(function(b, bi) {
      b.organ = organs[bi];
      var span = document.createElement('span');
      span.textContent = b.text;
      span.style.cssText = 'color:'+b.color+';text-shadow:0 0 6px '+b.color+';animation:w259b 2s ease-in-out infinite;animation-delay:'+b.delay+';';
      brandWrap.appendChild(span);
      var dot = document.createElement('span');
      dot.textContent = '·';
      dot.style.cssText = 'color:#555;';
      brandWrap.appendChild(dot);
    });
    brandWrap.lastChild.remove(); // remove trailing dot
    wrap.appendChild(brandWrap);

    // ═══ THREE RINGS BADGE ═══
    // ═══ LUNG SINE WAVE — like the outer-face green mesh ═══
    var lungCanvas = document.createElement('canvas');
    lungCanvas.width = Math.min(vw * 0.6, 200);
    lungCanvas.height = 20;
    lungCanvas.style.cssText = 'position:absolute;bottom:52px;left:50%;transform:translateX(-50%);opacity:0.2;';
    wrap.appendChild(lungCanvas);
    var lctx = lungCanvas.getContext('2d');
    var lframe = 0;
    function drawBreath() {
      lctx.clearRect(0, 0, lungCanvas.width, lungCanvas.height);
      lctx.strokeStyle = '#5aad72';
      lctx.lineWidth = 1;
      lctx.beginPath();
      for (var bx = 0; bx < lungCanvas.width; bx++) {
        var by = 10 + Math.sin((bx * 0.08) + lframe * 0.03) * 6 
                    + Math.sin((bx * 0.04) + lframe * 0.02) * 3;
        if (bx === 0) lctx.moveTo(bx, by);
        else lctx.lineTo(bx, by);
      }
      lctx.stroke();
      // Second harmonic
      lctx.strokeStyle = '#3a8050';
      lctx.lineWidth = 0.5;
      lctx.beginPath();
      for (var bx2 = 0; bx2 < lungCanvas.width; bx2++) {
        var by2 = 10 + Math.sin((bx2 * 0.12) + lframe * 0.05) * 4
                     + Math.cos((bx2 * 0.06) + lframe * 0.03) * 2;
        if (bx2 === 0) lctx.moveTo(bx2, by2);
        else lctx.lineTo(bx2, by2);
      }
      lctx.stroke();
      lframe++;
      requestAnimationFrame(drawBreath);
    }
    drawBreath();
    
    var badge = document.createElement('div');
    badge.style.cssText = 'position:absolute;left:50%;bottom:36px;transform:translateX(-50%);color:#5a5650;font-size:7px;opacity:0.3;white-space:nowrap;';
    badge.textContent = '💍 HUD·HUB·BUB — primals.eco + nestgate.io + primal.eco';
    wrap.appendChild(badge);

    
    // ═══ @HOME TRIO (three worlds, one traversal) ═══
    fetch('/data/athome-trio-259.json').then(function(r){return r.json()}).then(function(trio) {
      var worlds = trio.trio;
      var keys = ['play_at_home', 'seti_at_home', 'gaia_at_home'];
      var symbols = ['🎮','📡','🌍'];
      
      keys.forEach(function(key, i) {
        var w = worlds[key];
        var a = (w.angle_deg * Math.PI / 180) - Math.PI / 2;
        var mapping = trio.three_worlds.mapping[key];
        var wr = R * mapping.R_ratio;
        
        // World marker
        var wx = cx + Math.cos(a) * wr;
        var wy = cy + Math.sin(a) * wr;
        
        // Glowing dot for this world
        dot(wx, wy, 7, w.color, 0.5, true);
        
        // World label
        var wl = document.createElement('div');
        wl.className = 'lbl';
        wl.style.cssText = 'left:'+wx+'px;top:'+(wy+12)+'px;color:'+w.color+';font-size:9px;opacity:0.7;';
        wl.innerHTML = symbols[i] + ' ' + key.replace(/_/g,'@').replace(/@at@/,'@');
        wrap.appendChild(wl);
        
        // Direction arrow toward center (the @ fold)
        var line = document.createElement('div');
        var dx = cx - wx, dy = cy - wy;
        var len = Math.sqrt(dx*dx + dy*dy) * 0.6;
        line.style.cssText = 'position:absolute;left:'+wx+'px;top:'+wy+'px;width:'+len+'px;height:1px;background:linear-gradient(90deg,'+w.color+',transparent);opacity:0.08;transform-origin:0 0;transform:rotate('+Math.atan2(dy,dx)*180/Math.PI+'deg);';
        wrap.appendChild(line);
      });
      
      // The @ fold point at center
      var atSign = document.createElement('div');
      atSign.className = 'lbl';
      atSign.style.cssText = 'left:'+cx+'px;top:'+(cy-12)+'px;color:#fff;font-size:14px;opacity:0.4;text-shadow:0 0 8px #fff,0 0 16px #5aad72;';
      atSign.textContent = '@';
      wrap.appendChild(atSign);
      
      var el = document.getElementById('w259-left');
      if (el) el.innerHTML += '<span style="color:#d4a574">@</span> 3 worlds · 1 traversal<br>';
      
      
    // ═══ REAL PULSE + LUNG from gate :8443 ═══
    fetch('/data/pulse.json').then(function(r){return r.json()}).then(function(p) {
      var el = document.getElementById('w259-right');
      if (!el) return;
      
      if (p.heart) {
        el.innerHTML += '<br><span style="color:#f85149">❤</span> ' + 
          p.heart.total_beats.toLocaleString() + ' beats · ' + Math.round(p.heart.bpm) + ' bpm';
      }
      if (p.lung) {
        el.innerHTML += '<br><span style="color:#d4a574">🫁</span> ' + 
          p.lung.total_breaths.toLocaleString() + ' breaths · ' + Math.round(p.lung.brpm) + ' brpm';
        el.innerHTML += '<br><span style="color:#d4a574">🫁</span> ratio ' + p.lung.ratio + ':1';
        
        // Make breathing ring match real ratio
        var br = wrap.querySelector('[style*="w259breathe"]');
        if (br) br.style.animationDuration = Math.max(3, p.lung.ratio) + 's';
      }
      if (p.sun) {
        el.innerHTML += '<br><span style="color:#f0e68c">☀</span> sun ' + 
          Math.round(p.sun.elevation_deg) + '° · ' + p.sun.chord;
      }
      
      console.log('[W259] Gate pulse: bpm=' + (p.heart?p.heart.bpm:'?') + 
        ', brpm=' + (p.lung?p.lung.brpm:'?'));
    }).catch(function(e){ console.log('[W259] gate pulse:', e); });

    console.log('[W259] @home trio rendered — play · seti · gaia');
    }).catch(function(e){ console.log('[W259] athome fetch failed:', e); });

    
    // ═══ PIP BUBBLE — 2/3 + 1/3 snowglobe ═══
    var pipViews = [
      {name:'globe', url:'/kenshi-globe.html', label:'🌍 dream'},
      {name:'mesh', url:'/kenshi-mesh.html', label:'🕸 mesh'},
      {name:'reborn', url:'https://nestgate.io/kenshi-reborn', label:'🦎 A-Life'},
      {name:'deck', url:'/deck.html', label:'🎮 deck'},
      {name:'senses', url:'https://in.nestgate.io/', label:'👁 senses'},
      {name:'outer', url:'https://out.nestgate.io/', label:'☀ outer'},
      {name:'fold', url:'https://nestgate.io/', label:'∅ fold'},
      {name:'turbo', url:'/turbo.html', label:'🔥 turbo'},
      {name:'frame', url:'/frame.html', label:'📺 frame'},
      {name:'room', url:'/room.html', label:'🏚 room'},
      {name:'hub', url:'/nav-hub.html', label:'🗺 hub'}
    ];
    var pipIdx = 0;
    
    // PIP container — bottom-right 1/3 of screen
    var pip = document.createElement('div');
    pip.id = 'w259-pip';
    pip.style.cssText = 'position:fixed;bottom:48px;right:4px;width:33vw;height:40vh;border:1px solid rgba(90,173,114,0.3);border-radius:6px;overflow:hidden;z-index:9998;background:#08090b;display:none;pointer-events:auto;';
    
    // PIP header bar
    var pipBar = document.createElement('div');
    pipBar.style.cssText = 'position:absolute;top:0;left:0;right:0;height:20px;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:space-between;padding:0 6px;z-index:2;cursor:pointer;';
    
    var pipLabel = document.createElement('span');
    pipLabel.style.cssText = 'color:#5aad72;font-size:9px;font-family:monospace;';
    pipLabel.textContent = pipViews[0].label + ' · PIP';
    pipBar.appendChild(pipLabel);
    
    var pipNav = document.createElement('span');
    pipNav.style.cssText = 'color:#8a857e;font-size:9px;font-family:monospace;cursor:pointer;';
    pipNav.textContent = '◀ ▶ ✕';
    pipBar.appendChild(pipNav);
    pip.appendChild(pipBar);
    
    // PIP iframe
    var pipFrame = document.createElement('iframe');
    pipFrame.style.cssText = 'position:absolute;top:20px;left:0;width:100%;height:calc(100% - 20px);border:none;opacity:0.85;';
    pipFrame.src = '';
    pip.appendChild(pipFrame);
    wrap.appendChild(pip);
    
    // PIP toggle button (always visible)
    var pipBtn = document.createElement('div');
    pipBtn.style.cssText = 'position:fixed;bottom:48px;right:4px;width:28px;height:28px;background:rgba(0,0,0,0.6);border:1px solid rgba(90,173,114,0.2);border-radius:4px;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:9998;pointer-events:auto;font-size:14px;';
    pipBtn.textContent = '🫧';
    pipBtn.title = 'PIP Bubble';
    wrap.appendChild(pipBtn);
    
    var pipOpen = true;
    pip.style.display = 'block';
    pipFrame.src = pipViews[0].url;
    pipLabel.textContent = pipViews[0].label + ' · DREAM';
    pipBtn.style.display = 'none';
    pipBtn.addEventListener('click', function() {
      pipOpen = !pipOpen;
      if (pipOpen) {
        pip.style.display = 'block';
        pipFrame.src = pipViews[pipIdx].url;
        pipLabel.textContent = pipViews[pipIdx].label + ' · PIP';
        pipBtn.style.display = 'none';
      } else {
        pip.style.display = 'none';
        pipFrame.src = '';
        pipBtn.style.display = 'flex';
      }
    });
    
    pipNav.addEventListener('click', function(e) {
      var rect = pipNav.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var third = rect.width / 3;
      
      if (x < third) {
        // Prev
        pipIdx = (pipIdx - 1 + pipViews.length) % pipViews.length;
      } else if (x > third * 2) {
        // Close
        pipOpen = false;
        pip.style.display = 'none';
        pipFrame.src = '';
        pipBtn.style.display = 'flex';
        return;
      } else {
        // Next
        pipIdx = (pipIdx + 1) % pipViews.length;
      }
      pipFrame.src = pipViews[pipIdx].url;
      pipLabel.textContent = pipViews[pipIdx].label + ' · PIP';
    });

    console.log('[W259] Klein dissolution v4 — THE GLASS — visible');
  }

  var ready = function() { setTimeout(build, 2000); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();

  var resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 300);
  });

  setInterval(function() {
    if (document.getElementById('w259')) { document.getElementById('w259').remove(); build(); }
  }, 30000);
})();
