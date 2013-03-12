(function(global) {
  var attr = 'trigger';
  var e = document.createelement('div');
  var mo = window.MutationObserver || window.WebKitMutationObserver;
  var fns = [];
  var caller = function(f){ f(); };
  var o = new mo(function() {
    fns.forEach(caller);
    fns = [];
    e.removeAttribute(attr);
    o.takeRecords();
  });
  var emt = function(f) {
    if (!fns.length) {
      e.setAttribute(attr);
    }
    fns.push(f);
  }
  o.observe(e, {attributes: true});
  Object.defineProperty(
    Object.getPrototypeOf(global),
    'endOfMicroTask',
    {
      value: emt.bind(global),
      enumerable: true
    }
  );
})(window);
