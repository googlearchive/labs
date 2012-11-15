/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {
  var walk = function(n, u) {
    for (var i = 0; i < u; i++) {
      n = n.parentNode;
    }
    return n;
  };
  var depth = function(n) {
    var d = 0;
    while(n) {
      d++;
      n = n.parentNode;
    }
    return d;
  };
  var utils = {
    // Lowest Common Ancestor
    lca: function(inNodeA, inNodeB) {
      var a = inNodeA, b = inNodeB;
      var adepth = depth(a);
      var bdepth = depth(b);
      var d = adepth - bdepth;
      if (d > 0) {
        a = walk(a, d);
      } else {
        b = walk(b, -d);
      }
      while(a && b && a !== b) {
        a = walk(a, 1);
        b = walk(b, 1);
      }
      return a;
    },
    distance: function(inE1, inE2) {
      var dx = inE2.clientX - inE1.clientX;
      var dy = inE2.clientY - inE1.clientY;
      return Math.sqrt(dx * dy + dy * dy);
    },
    angle: function(inE1, inE2) {
      var dx = inE2.clientX - inE1.clientX;
      var dy = inE2.clientY - inE1.clientY;
      return Math.atan2(dy, dx) * 180 / Math.PI;
    }
  };
  scope.utils = utils;
})(window.__PointerGestureShim__);
