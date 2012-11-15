/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {
  var dispatcher = scope.dispatcher;
  var zoomrotate = {
    pointermap: new PointerMap,
    target: null,
    distance: 0,
    angle: 0,
    events: [
      'pointerdown',
      'pointermove',
      'pointerup',
      'pointercancel'
    ],
    updatePointer: function(inEvent, inPointer) {
      var p = this.pointermap.getPointer(inEvent.pointerId);
      if (p) {
        p.x = inEvent.clientX;
        p.y = inEvent.clientY;
        p.target = inEvent.target;
      }
    },
    walk: function(n, u) {
      for (var i = 0; i < u; i++) {
        n = n.parentNode;
      }
      return n;
    },
    depth: function(n) {
      var d = 0;
      while(n) {
        d++;
        n = n.parentNode;
      }
      return d;
    },
    // Lowest Common Ancestor
    findLCA: function(a, b) {
      var adepth = this.depth(a);
      var bdepth = this.depth(b);
      var d = adepth - bdepth;
      if (d > 0) {
        a = this.walk(a, d);
      } else {
        b = this.walk(b, -d);
      }
      while(a && b && a !== b) {
        a = this.walk(a, 1);
        b = this.walk(b, 1);
      }
      return a;
    },
    calcDistance: function(a, b) {
      var dx = b.x - a.x;
      var dy = b.y - a.y;
      return Math.sqrt(dx * dx + dy * dy);
    },
    calcAngle: function(a, b) {
      var dx = b.x - a.x;
      var dy = b.y - a.y;
      return Math.atan2(dy, dx) * 180 / Math.PI;
    },
    fireGesture: function(inType) {
      var p1 = this.pointermap.pointers[0];
      var p2 = this.pointermap.pointers[1];
      var d = this.calcDistance(p1, p2);
      var x = p1.x + (p2.x - p1.x) / 2;
      var y = p1.y + (p2.y - p1.y) / 2;
      var zoom = d / this.distance;
      var angle = (360 + this.calcAngle(p1, p2) - this.angle) % 360;
      var e = dispatcher.makeEvent(inType, {
        x: x,
        y: y,
        zoom: zoom,
        angle: angle
      });
      dispatcher.dispatchEvent(e, this.target);
    },
    pointerdown: function(inEvent) {
      this.pointermap.addPointer(inEvent.pointerId);
      this.updatePointer(inEvent);
      if (this.pointermap.size() == 2) {
        var a = this.pointermap.pointers[0];
        var b = this.pointermap.pointers[1];
        this.target = this.findLCA(a.target, b.target);
        this.distance = this.calcDistance(a, b);
        this.angle = this.calcAngle(a, b);
        this.fireGesture('tkgesturestart');
      }
    },
    pointermove: function(inEvent) {
      this.updatePointer(inEvent);
      if (this.pointermap.size() >= 2) {
        this.fireGesture('tkgesture');
      }
    },
    pointerup: function(inEvent) {
      if (this.pointermap.size() == 2) {
        this.fireGesture('tkgestureend');
      }
      this.pointermap.removePointer(inEvent.pointerId);
    },
    pointercancel: function(inEvent) {
      this.pointerup(inEvent);
    }
  };
  dispatcher.registerRecognizer(zoomrotate);
})(window.__PointerGestureShim__);
