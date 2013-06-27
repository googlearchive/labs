(function() {
  'use strict';
  var n = document.createTextNode('');
  var mo = window.MutationObserver || window.WebKitMutationObserver;
  var iteration = 0;
  var fns = [];

  var o = new mo(function() {
    for (var i = 0; i < fns.length; i++) {
      try {
        // avoid leaking forEach iteration arguments to f
        fns[i].call(window);
      } catch(_) {
      }
    }
    fns = [];
  });
  o.observe(n, {characterData: true});

  function EOMT(f) {
    if (!fns.length) {
      // trigger observer
      n.textContent = iteration++;
    }
    fns.push(f);
  }
  Object.defineProperty(
    Object.getPrototypeOf(window),
    'endOfMicroTask',
    {
      value: EOMT.bind(),
      enumerable: true
    }
  );
  window.emotNode = n;
})();
