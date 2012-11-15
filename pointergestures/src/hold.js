/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

/**
 * This module produces hold events from pointerup, pointermove, pointerdown,
 * and pointercancel.
 *
 * Events fired:
 *  - tkhold: a pointer is held down and not moved for at least 200 ms.
 *  - tkholdpulse: a pointer is being held down and not moved for at least 200ms
 *  since the last tkhold or tkholdpulse event.
 *  - tkrelease: a pointer is released from being held, or moved from the hold
 *  position.
 *
 * Additional Properties (on tkhold and tkholdpulse):
 *  - holdTime: amount of time the pointer has been held down and not moved.
 */

(function(scope) {
  var dispatcher = scope.dispatcher;
  var hold = {
    // wait at least HOLD_DELAY ms between hold and pulse events
    HOLD_DELAY: 200,
    // pointer can move WIGGLE_THRESHOLD pixels before not counting as a hold
    WIGGLE_THRESHOLD: 16,
    events: [
      'pointerdown',
      'pointermove',
      'pointerup'
    ],
    heldPointer: null,
    holdJob: null,
    pulse: function() {
      var hold = Date.now() - this.heldPointer.timeStamp;
      var type = this.held ? 'tkholdpulse' : 'tkhold';
      this.fireHold(type, {holdTime: hold});
      this.held = true;
    },
    cancel: function() {
      clearInterval(this.holdJob);
      this.fireHold('tkrelease');
      this.held = false;
      this.heldPointer = null;
      this.holdJob = null;
    },
    pointerdown: function(inEvent) {
      if (inEvent.isPrimary) {
        this.heldPointer = inEvent;
        this.holdJob = setInterval(this.pulse.bind(this), this.HOLD_DELAY);
      }
    },
    pointerup: function(inEvent) {
      if (this.heldPointer && inEvent.isPrimary) {
        this.cancel();
      }
    },
    pointermove: function(inEvent) {
      if (this.heldPointer && inEvent.isPrimary) {
        var x = inEvent.clientX - this.heldPointer.clientX;
        var y = inEvent.clientY - this.heldPointer.clientY;
        if ((x * x + y * y) > this.WIGGLE_THRESHOLD) {
          this.cancel();
        }
      }
    },
    fireHold: function(inType, inProps) {
      var p = inProps || {};
      var e = dispatcher.makeEvent(inType, p);
      dispatcher.dispatchEvent(e, this.heldPointer.target);
    }
  };
  dispatcher.registerRecognizer(hold);
})(window.__PointerGestureShim__);
