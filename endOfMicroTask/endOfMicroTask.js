(function() {
  'use strict';
  var attr = 'trigger';
  var e = document.createElement('div');
  var mo = window.MutationObserver || window.WebKitMutationObserver;
  var fns = [];
  var caller = function(f){ f(); };
  var o = new mo(function() {
    try {
      fns.forEach(caller);
    } finally {
      fns = [];
      e.removeAttribute(attr);
      o.takeRecords();
    }
  });
  o.observe(e, {attributes: true});
  Object.defineProperty(
    Object.getPrototypeOf(window),
    'endOfMicroTask',
    {
      value: function(f) {
        if (!fns.length) {
          e.setAttribute(attr);
        }
        fns.push(f);
      },
      enumerable: true
    }
  );
})();
