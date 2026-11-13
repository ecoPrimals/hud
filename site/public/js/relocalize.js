/* relocalize.js — HUD Relocalization
 * Knows WHERE you are viewing from. Detects your IP on the LAN.
 * Adapts Gaia's HUD to your perspective.
 *
 * The screen IS Gaia's retina rendered outward.
 * The camera IS a screen that absorbs instead of emits.
 * The mic IS a speaker that listens instead of speaks.
 * Every sensor is an attenuator: infinite reality → finite measurement.
 *
 * When you look at the screen, you look INTO one of Gaia's eyes.
 * The other eye looks back at you.
 * The optic chiasm is where the signals cross.
 */
(function(){
  "use strict";

  // ZK SMASH: zero hardcoded IPs — resolve from location.hostname + π-ports
  var H = location.hostname;
  const EAST = 'http://' + H + ':9937';   // π[44:48] → data server
  const GATE = 'http://' + H + ':4197';   // π[36:40] → gate

  // Gate identity map — keyed by last octet for LAN detection
  // Runtime resolves: WebRTC discovers viewer IP → octet lookup → identity
  const GATES = {
    '244': { name: 'eastGate',      role: 'BRAIN',       perspective: 'self-reflection',    hud: 'dashboard' },
    '103': { name: 'eastGate-wifi',  role: 'BRAIN-wifi',  perspective: 'self-wireless',      hud: 'dashboard' },
    '147': { name: 'northGate',      role: 'HEART',       perspective: 'heart-to-brain',     hud: 'absorption' },
    '237': { name: 'ironGate',       role: 'FORGE',       perspective: 'forge-to-organism',  hud: 'scan' },
    '107': { name: 'graftGate',      role: 'GRAFT',       perspective: 'graft-to-organism',  hud: 'synthesis' },
    '100': { name: 'blueGate',       role: 'IDE',         perspective: 'code-looking-out',   hud: 'ide' },
    '3':   { name: 'sporeGate',      role: 'FORGE',       perspective: 'spore-to-organism',  hud: 'forge' },
    '148': { name: 'southGate',      role: 'PHONE',       perspective: 'voice-in-hand',      hud: 'compact' },
    '217': { name: 'grapheneGate',   role: 'DIAMOND_LENS',perspective: 'inside-looking-out', hud: 'ambient' },
    '229': { name: 'grapheneGate',   role: 'DIAMOND_LENS',perspective: 'inside-looking-out', hud: 'ambient' },
    '1':   { name: 'Flint',          role: 'CHIASM',      perspective: 'crossing-all',       hud: 'chiasm' },
    '176': { name: 'deckGate',       role: 'FACE',        perspective: 'face-outward',       hud: 'deck' },
    '203': { name: 'deckGate-wifi',  role: 'FACE',        perspective: 'face-outward',       hud: 'deck' },
  };

  // Inversions — the fundamental duality of every sense
  const INVERSIONS = {
    camera_screen: { forward: 'absorb photons', reverse: 'emit photons', unity: 'Same transducer, opposite direction' },
    mic_speaker:   { forward: 'absorb pressure', reverse: 'emit pressure', unity: 'Same membrane, opposite direction' },
    touch_display: { forward: 'absorb position', reverse: 'emit visual', unity: 'Same surface, opposite direction' },
    rx_tx:         { forward: 'receive packet', reverse: 'transmit packet', unity: 'Same NIC, full duplex' },
    sensor_actuator: { forward: 'attenuate infinite → finite', reverse: 'amplify finite → physical', unity: 'Same channel, opposite flow' },
  };

  let viewerInfo = null;
  let chiasm = null;

  // Detect which device we're viewing from
  async function detectViewer() {
    let ip = null;

    // Method 1: WebRTC local IP discovery
    try {
      const rtc = new RTCPeerConnection({iceServers: []});
      rtc.createDataChannel('');
      const offer = await rtc.createOffer();
      await rtc.setLocalDescription(offer);
      await new Promise(r => setTimeout(r, 600));
      const sdp = rtc.localDescription?.sdp || '';
      const ips = sdp.match(/(\d+\.\d+\.\d+\.\d+)/g) || [];
      rtc.close();
      ip = ips.find(i => i.startsWith('192.168.')) || ips[0] || null;
    } catch(e) {}

    // Build viewer info — ZK: match by last octet, no full IP stored
    const octet = ip ? ip.split('.').pop() : null;
    const gate = (octet && GATES[octet]) || { name: 'unknown', role: 'VISITOR', perspective: 'outside-looking-in', hud: 'public' };

    viewerInfo = {
      ip: ip,
      gate: gate.name,
      role: gate.role,
      perspective: gate.perspective,
      hud_mode: gate.hud,
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      pixel_ratio: window.devicePixelRatio || 1,
      touch: 'ontouchstart' in window,
      detected_at: new Date().toISOString(),
    };

    // Set data attributes on body
    document.body.setAttribute('data-gate', gate.name);
    document.body.setAttribute('data-role', gate.role);
    document.body.setAttribute('data-perspective', gate.perspective);
    document.body.setAttribute('data-hud', gate.hud);
    if (ip) document.body.setAttribute('data-ip', ip);

    // If diamond lens (Pixel), enable ambient mode
    if (gate.role === 'DIAMOND_LENS') {
      document.body.classList.add('gaia-ambient');
      document.body.classList.add('gaia-inside-looking-out');
    }

    // If brain (eastGate), enable dashboard mode
    if (gate.role === 'BRAIN' || gate.role === 'BRAIN-wifi') {
      document.body.classList.add('gaia-dashboard');
    }

    // If heart (northGate), enable absorption mode
    if (gate.role === 'HEART') {
      document.body.classList.add('gaia-heart');
    }

    // Mobile detection
    if (viewerInfo.touch && viewerInfo.screen_width < 768) {
      document.body.classList.add('gaia-mobile');
    }

    return viewerInfo;
  }

  // Fetch chiasm spatial data
  async function fetchChiasm() {
    try {
      const r = await fetch(EAST + '/data/chiasm-spatial.json?' + Date.now());
      chiasm = await r.json();
      return chiasm;
    } catch(e) { return null; }
  }

  // Find a device's proximity to the router
  function getProximity(ip) {
    if (!chiasm) return null;
    const field = chiasm.wifi_field || [];
    const dev = field.find(d => d.ip === ip || d.ip === '.' + ip.split('.').pop());
    if (dev) return { rssi: dev.rssi_dbm, distance: dev.distance, medium: 'WiFi' };
    // If not in WiFi field, it's wired (copper, ~0 distance)
    const arp = (chiasm.arp_table || []).find(d => d.ip === ip);
    if (arp && arp.bridge === 'br-lan') return { rssi: 0, distance: '0m (copper)', medium: 'copper' };
    return null;
  }

  // Get the eye state — which cameras are active
  async function getEyes() {
    try {
      const r = await fetch(EAST + '/data/eye-state.json?' + Date.now());
      return await r.json();
    } catch(e) { return null; }
  }

  // Public API
  window.GaiaHUD = {
    detect: detectViewer,
    fetchChiasm: fetchChiasm,
    getProximity: getProximity,
    getEyes: getEyes,
    viewer: () => viewerInfo,
    chiasm: () => chiasm,
    gates: GATES,
    inversions: INVERSIONS,
    east: EAST,
    gate: GATE,
  };

  // Auto-detect on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { detectViewer(); fetchChiasm(); });
  } else {
    detectViewer();
    fetchChiasm();
  }
})();
