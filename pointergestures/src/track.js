/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

/**
 * This module produces tracking events from pointerup and pointerdown
 * Events fired:
 *  - tktackstart: primary pointer is added
 *  - tktrack: primary pointer is moving
 *  - tktrackend: primary pointer is removed
 *    - Additional Properties:
 *      - dx: movement in the x direction since tktrackstart
 *      - dy: movement in the y direction since tktrackstart
 *      - ddx: movement in the x direction since the last tktrack
 *      - ddy: movement in the y direction since the last tktrack
 *      - xDirection: The last x axis movement direction of the pointer
 *      - yDirection: The last y axis movement direction of the pointer
 *      - trackInfo: A shared object between all tracking events
 */

(function(scope) {
  var dispatcher = scope.dispatcher;
  var track = {
    events: [
      'pointerdown',
      'pointermove',
      'pointerup'
    ],
    WIGGLE_THRESHOLD: 4,
    down: null,
    lastMove: null,
    tracking: false,
    xDirection: 0,
    yDirection: 0,
    trackInfo: null,
    clampDir: function(inDelta) {
      return inDelta > 0 ? 1 : -1;
    },
    calcPositionDelta: function(inA, inB) {
      var x = 0, y = 0;
      if (inA && inB) {
        x = inB.clientX - inA.clientX;
        y = inB.clientY - inA.clientY;
      }
      return {x: x, y: y};
    },
    fireTrack: function(inType, inEvent) {
      var d = this.calcPositionDelta(this.downEvent, inEvent);
      var dd = this.calcPositionDelta(this.lastMoveEvent, inEvent);
      if (dd.x) {
        this.xDirection = this.clampDir(dd.x);
      }
      if (dd.y) {
        this.yDirection = this.clampDir(dd.y);
      }
      var e = dispatcher.makeEvent(inType, {
        dx: d.x,
        dy: d.y,
        ddx: dd.x,
        ddy: dd.y,
        xDirection: this.xDirection,
        yDirection: this.yDirection,
        trackInfo: this.trackInfo
      });
      this.lastMoveEvent = inEvent;
      dispatcher.dispatchEvent(e, this.downEvent.target);
    },
    pointerdown: function(inEvent) {
      if (inEvent.isPrimary) {
        this.downEvent = inEvent;
        this.trackInfo = {};
        this.lastMoveEvent = null;
        this.xDirection = 0;
        this.yDirection = 0;
      }
    },
    pointermove: function(inEvent) {
      if (inEvent.isPrimary && this.downEvent) {
        if (!this.tracking) {
          var d = this.calcPositionDelta(this.downEvent, inEvent);
          var move = d.x * d.x + d.y * d.y;
          // start tracking only if finger moves more than WIGGLE_THRESHOLD
          if (move > this.WIGGLE_THRESHOLD) {
            this.tracking = true;
            this.fireTrack('tktrackstart', this.downEvent);
            this.fireTrack('tktrack', inEvent);
          }
        } else {
          this.fireTrack('tktrack', inEvent);
        }
      }
    },
    pointerup: function(inEvent) {
      if (inEvent.isPrimary && this.downEvent) {
        if (this.tracking) {
          this.fireTrack('tktrackend', inEvent);
          this.tracking = false;
        }
        this.downEvent = null;
      }
    }
  }
  dispatcher.registerRecognizer(track);
})(window.__PointerGestureShim__);
