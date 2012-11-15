/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {
  var dispatcher = scope.dispatcher;
  var utils = scope.utils;
  var zoomrotate = {
    pointermap: new PointerMap,
    target: null,
    distance: 0,
    angle: 0,
    lastDistance: 0,
    lastAngle: 0,
    zoomDirection: 0,
    angleDirection: 0,
    events: [
      'pointerdown',
      'pointermove',
      'pointerup',
      'pointercancel'
    ],
    updatePointer: function(inEvent, inPointer) {
      var p = this.pointermap.getPointer(inEvent.pointerId);
      if (p) {
        p.event = inEvent;
      }
    },
    calcDistance: function(a, b) {
      return utils.distance(a, b);
    },
    calcAngle: function(a, b) {
      return utils.angle(a, b);
    },
    fireGesture: function(inType) {
      var p1 = this.pointermap.pointers[0];
      var p2 = this.pointermap.pointers[1];
      var d = this.calcDistance(p1, p2);
      var x = p1.clientX + (p2.clientX - p1.clientX) / 2;
      var y = p1.clientY + (p2.clientY - p1.clientY) / 2;
      var zoom = d / this.distance;
      var zd = d - this.lastDistance;
      if (zd) {
        this.zoomDirection = zd > 0 ? 1 : -1;
      }
      this.lastDistance = d;
      var angle = (360 + this.calcAngle(p1, p2) - this.angle) % 360;
      var ad = angle - this.lastAngle;
      if (ad) {
        this.angleDirection = ad > 0 ? 1 : -1;
      }
      this.lastAngle = angle;
      var e = dispatcher.makeEvent(inType, {
        x: x,
        y: y,
        zoom: zoom,
        angle: angle,
        distance: d,
        zoomDirection: this.zoomDirection,
        angleDirection: this.angleDirection
      });
      dispatcher.dispatchEvent(e, this.target);
    },
    pointerdown: function(inEvent) {
      this.pointermap.addPointer(inEvent.pointerId);
      this.updatePointer(inEvent);
      if (this.pointermap.size == 2) {
        var a = this.pointermap.pointers[0];
        var b = this.pointermap.pointers[1];
        this.target = utils.lca(a.target, b.target);
        this.distance = this.calcDistance(a, b);
        this.angle = this.calcAngle(a, b);
        this.fireGesture('tkgesturestart');
      }
    },
    pointermove: function(inEvent) {
      this.updatePointer(inEvent);
      if (this.pointermap.size >= 2) {
        this.fireGesture('tkgesture');
      }
    },
    pointerup: function(inEvent) {
      if (this.pointermap.size == 2) {
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
