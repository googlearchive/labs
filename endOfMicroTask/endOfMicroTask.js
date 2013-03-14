(function() {
  'use strict';
  var attr = 'trigger';
  var e = document.createElement('div');
  var mo = window.MutationObserver || window.WebKitMutationObserver;
  var fns = [];
  // avoid leaking forEach iteration arguments to f
  var caller = function(f){ f(); };
  var o = new mo(function() {
    // make sure we can clean up if a function throws
    try {
      fns.forEach(caller);
    } finally {
      fns = [];
      // reset attribute for next round
      e.removeAttribute(attr);
      // prevent calling handler again because of attribute reset
      o.takeRecords();
    }
  });
  o.observe(e, {attributes: true});
  function mutEMOT(f) {
    if (!fns.length) {
      // trigger observer
      e.setAttribute(attr);
    }
    fns.push(f);
  }
  Object.defineProperty(
    Object.getPrototypeOf(window),
    'endOfMicroTask',
    {
      value: mutEMOT.bind(),
      enumerable: true
    }
  );
})();
