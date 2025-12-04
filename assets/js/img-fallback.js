(function(){
  function applyFallback(img){
    var fallback = img.getAttribute('data-fallback');
    if (!fallback) return;
    if (img.dataset._appliedFallback) return;
    img.dataset._appliedFallback = '1';
    img.src = fallback;
  }
  function enhance(img){
    if (!img.complete){
      img.addEventListener('error', function(){ applyFallback(img); });
    } else if (img.naturalWidth === 0){
      applyFallback(img);
    }
  }
  document.querySelectorAll('img[data-fallback]').forEach(enhance);
  // Mutation observer cho ảnh được thêm động
  var obs = new MutationObserver(function(mutations){
    mutations.forEach(function(m){
      m.addedNodes && m.addedNodes.forEach(function(n){
        if (n.tagName === 'IMG' && n.hasAttribute('data-fallback')) enhance(n);
        if (n.querySelectorAll){
          n.querySelectorAll('img[data-fallback]').forEach(enhance);
        }
      });
    });
  });
  obs.observe(document.documentElement,{ childList:true, subtree:true });
})();
