// wave259-loader.js — sourDough cache breaker
// Checks every 60s if overlay changed. No hard reload needed.
(function(){
  var VER = "259.1794932725";
  var SRC = "/js/wave259-overlay.js";
  
  function loadOverlay() {
    var s = document.createElement('script');
    s.src = SRC + "?w=259&t=" + Date.now();
    s.defer = true;
    document.head.appendChild(s);
  }
  
  // Initial load after 1.5s
  setTimeout(loadOverlay, 1500);
  
  // Check for freshness every 60s
  setInterval(function() {
    fetch(SRC + "?check=" + Date.now(), {method:'HEAD'}).then(function(r) {
      var mod = r.headers.get('last-modified');
      if (mod && mod !== window._w259mod) {
        window._w259mod = mod;
        var old = document.getElementById('w259');
        if (old) old.remove();
        // Remove old script tags
        document.querySelectorAll('script[src*="wave259-overlay"]').forEach(function(s){
          s.remove();
        });
        loadOverlay();
        console.log('[sourDough] fresh bread — reloaded overlay');
      }
    }).catch(function(){});
  }, 60000);
})();
