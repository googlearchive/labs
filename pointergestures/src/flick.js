/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

/**
 * This module produces pointerflick events from pointerup and pointerdown
 * Events fired:
 *  - tkflick: a pointer is placed down, moves rapidly, and is then
 *  removed.
 *    - Additional Properties:
 *      - xVelocity: signed velocity of the flick in the x direction
 *      - yVelocity: signed velocity of the flick in the y direction
 *      - velocity: unsigned total velocity of the flick
 *      - angle: angle of the flick in degress, where 0 is along the positive
 *        x axis
 *      - majorAxis: Axis with the greatest absolute velocity. Denoted with
 *        'x' or 'y'
 */

(function(scope) {
  var dispatcher = scope.dispatcher;
  var utils = scope.utils;
  var flick = {
    // TODO(dfreedman): value should be low enough for low speed flicks, but
    // high enough to remove accidental flicks
    MIN_VELOCITY: 0.5 /* px/ms */,
    events: [
      'pointerdown',
      'pointerup'
    ],
    flickStart: null,
    pointerdown: function(inEvent) {
      if (inEvent.isPrimary) {
        this.flickStart = inEvent;
      }
    },
    pointerup: function(inEvent) {
      if (inEvent.isPrimary) {
        if (this.flickStart) {
          this.fireFlick(this.flickStart, inEvent);
          this.flickStart = null;
        }
      }
    },
    fireFlick: function(inStartEvent, inEvent) {
      var s = inStartEvent, e = inEvent;
      var dt = e.timeStamp - s.timeStamp;
      var dx = e.clientX - s.clientX, dy = e.clientY - s.clientY;
      var x = dx / dt, y = dy / dt, v = Math.sqrt(x * x + y * y);
      var ma = Math.abs(x) > Math.abs(y) ? 'x' : 'y';
      var a = this.calcAngle(s, e);
      if (Math.abs(v) >= this.MIN_VELOCITY) {
        var ev = dispatcher.makeEvent('tkflick', {
          xVelocity: x,
          yVelocity: y,
          velocity: v,
          angle: a,
          majorAxis: ma
        });
        dispatcher.dispatchEvent(ev, s.target);
      }
    },
    calcAngle: function(inA, inB) {
      return utils.angle(inA.clientX, inB.clientX, inA.clientY, inB.clientY);
    }
  };
  dispatcher.registerRecognizer(flick);
})(window.__PointerGestureShim__);
