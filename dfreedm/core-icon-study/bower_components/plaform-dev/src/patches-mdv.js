/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
(function(scope) {

// inject style sheet
var style = document.createElement('style');
style.textContent = 'template {display: none !important;} /* injected by platform.js */';
var head = document.querySelector('head');
head.insertBefore(style, head.firstChild);

// flush (with logging)
var flushing;
function flush() {
  if (!flushing) {
    flushing = true;
    scope.endOfMicrotask(function() {
      flushing = false;
      logFlags.data && console.group('Platform.flush()');
      scope.performMicrotaskCheckpoint();
      logFlags.data && console.groupEnd();
    });
  }
};

// polling dirty checker
// flush periodically if platform does not have object observe.
if (!Observer.hasObjectObserve) {
  var FLUSH_POLL_INTERVAL = 125;
  window.addEventListener('WebComponentsReady', function() {
    flush();
    scope.flushPoll = setInterval(flush, FLUSH_POLL_INTERVAL);
  });
} else {
  // make flush a no-op when we have Object.observe
  flush = function() {};
}

if (window.CustomElements && !CustomElements.useNative) {
  var originalImportNode = Document.prototype.importNode;
  Document.prototype.importNode = function(node, deep) {
    var imported = originalImportNode.call(this, node, deep);
    CustomElements.upgradeAll(imported);
    return imported;
  }
}

// exports
scope.flush = flush;

})(window.Platform);

