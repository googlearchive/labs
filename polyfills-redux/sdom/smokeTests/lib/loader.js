(function() {
  var root = "../";
  [
    'base/sdom.js',
    'ShadowDOM.js',
    'querySelector.js',
    'ShadowDOMNohd.js',
    'inspector.js',
  ].forEach(function(p) {
    document.write('<script src="' + root + p + '"></script>');
  });
})();
