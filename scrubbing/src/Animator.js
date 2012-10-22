(function(scope) {
  scope = scope || {};
  
  var Animator = function(inProps) {
    scope.mixinProps(this, inProps);
    this._next = this.next.bind(this);
  }

  Animator.easing = {
    cubicIn: function(n) {
      return Math.pow(n, 3);
    },
    cubicOut: function(n) {
      return Math.pow(n - 1, 3) + 1;
    },
    expoOut: function(n) {
      return (n == 1) ? 1 : (-1 * Math.pow(2, -10 * n) + 1);
    },
    quadInOut: function(n){
      n = n * 2;
      if (n < 1) {
        return Math.pow(n, 2) / 2;
      }
      return -1 * ((--n) * (n - 2) - 1) / 2;
    },
    linear: function(n) {
      return n;
    }
  };


  Animator.prototype = {
    //* Animation duration in milliseconds
    duration: 350,
    //* Value of _value_ property at the beginning of an animation
    startValue: 0,
    //* Value of _value_ property at the end of an animation
    endValue: 1,
    //* Node that must be visible in order for the animation to continue.
    //* This reference is destroyed when the animation ceases.
    node: null,
    //* Function that determines how the animation progresses from
    //* _startValue_ to _endValue_
    easingFunction: Animator.easing.cubicOut,
    //* Plays the animation.
    play: function(inProps) {
      scope.mixinProps(this, inProps);
      this.stop();
      this.reversed = false;
      this.t0 = this.t1 = Date.now();
      this.value = this.startValue;
      this.job = true;
      this.next();
      return this;
    },
    //* Stops the animation and fires the _onStop_ event.
    stop: function() {
      if (this.isAnimating()) {
        this.cancel();
        scope.invoke(this, "onStop", this);
        return this;
      }
    },
    //* Reverses the direction of a running animation; returns self if animating.
    reverse: function() {
      if (this.isAnimating()) {
        this.reversed = !this.reversed;
        var now = this.t1 = Date.now();
        // adjust start time (t0) to allow for animation done so far to replay
        var elapsed = now - this.t0;
        this.t0 = now + elapsed - this.duration;
        // swap start and end values
        var startValue = this.startValue;
        this.startValue = this.endValue;
        this.endValue = startValue;
        return this;
      }
    },
    //* Returns true if animation is in progress.
    isAnimating: function() {
      return Boolean(this.job);
    },
    requestNext: function() {
      this.job = webkitRequestAnimationFrame(this._next, this.node);
    },
    cancel: function() {
      webkitCancelRequestAnimationFrame(this.job);
      this.node = null;
      this.job = null;
    },
    shouldEnd: function() {
      return (this.dt >= this.duration);
    },
    next: function() {
      this.t1 = Date.now();
      this.dt = this.t1 - this.t0;
      // time independent
      var f = this.fraction = this.easedLerp(this.t0, this.duration, 
        this.easingFunction, this.reversed);
      this.value = this.startValue + f * (this.endValue - this.startValue);
      if (f >= 1 || this.shouldEnd()) {
        this.value = this.endValue;
        this.fraction = 1;
        scope.invoke(this, "onStep", this);
        this.cancel();
        scope.invoke(this, "onEnd", this);
      } else {
        scope.invoke(this, "onStep", this);
        this.requestNext();
      }
    },
    easedLerp: function(inT0, inDuration, inEasing, inReverse) {
      var lerp = (Date.now() - inT0) / inDuration;
      if (inReverse) {
        return lerp >= 1 ? 0 : (1 - inEasing(1 - lerp));
      } else {
        return lerp >= 1 ? 1 : inEasing(lerp);
      }
    }
  };
  // exports
  scope.Animator = Animator;
})(window.scrubbing);