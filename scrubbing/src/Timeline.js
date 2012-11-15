(function(scope) {
  scope = scope || {};
  
  var Timeline = function(inProps) {
    this.animations = [];
    scope.mixinProps(this, inProps);
    if (!this.position) {
      this.position = 0;
    }
    this.animator = this.makeAnimator();
  };
    
  Timeline.prototype = {
    duration: 500,
    snapPoints: null,
    noWrap: false,
    dragScale: 1,
    direction: 'x',
    addAnimation: function(inAnimation) {
      this.animations.push(inAnimation);
      inAnimation.position = this.position;
    },
    removeAnimation: function(inAnimation) {
      var i = this.animations.indexOf(inAnimation);
      if (i >= 0) {
        this.animation.splice(i, 1);
      }
    },
    get position() {
      return this._position;
    },
    set position(inValue) {
      var p = this._position = this.noWrap ? Math.max(0, Math.min(inValue, 1)) :
          inValue % 1;
      this.animations.forEach(function(a) {
        a.position = p;
      });
      
    },
    previous: function() {
      this.animateToPosition(this.calcSnapPoints(this.position - 1e-8).start);
    },
    next: function() {
      this.animateToPosition(this.calcSnapPoints(this.position).end);
    },
    calcSnapPoints: function(inPosition) {
      var snapPoints = [0];
      snapPoints = snapPoints.concat(this.snapPoints || []);
      snapPoints.push(1);
      var sign = inPosition >= 0 ? 1 : -1;
      var p = Math.abs(inPosition), l;
      for (var i=0, l=snapPoints.length, prev=0, snap, s, e; i<l; i++) {
        snap = snapPoints[i];
        if (prev <= p && snap > p) {
          s = sign * prev;
          e = sign * snap;
          return {start: Math.min(s, e), end: Math.max(s, e)};
        }
        prev = snap;
      }
      return {start: 0, end: 1};
    },
    animateToPosition: function(inPosition) {
      this.animator.stop();
      //console.warn('animateToPosition', this.position, inPosition);
      this.animator.play({
        duration: this.duration * Math.abs(inPosition - this.position),
        startValue: this.position,
        endValue: inPosition
      });
    },
    makeAnimator: function() {
      return new scope.Animator({
        duration: this.duration,
        context: this,
        onStep: function(inAnimation) {
          this.position = inAnimation.value;
        },
        onStop: function(inAnimation) {
          //this.position = inAnimation.endValue;
        },
        onEnd: function(inAnimation) {
          this.fireEvent('transitionEnd');
        }
      });
    },
    fireEvent: function(inType) {
      if (this.trackingNode) {
        var detail = {timeline: this};
        var event = new CustomEvent(inType, {bubbles: true, detail: detail});
        this.trackingNode.dispatchEvent(event);
      }
    },
    get trackingNode () {
      return this._trackingNode;
    },
    set trackingNode(inNode) {
      if (this.trackingNode) {
        this.trackingNode.timeline = null;
        this.enableEvents(this.trackingNode, this.trackingEventInfo, false);
      }
      this._trackingNode = inNode;
      inNode.timeline = this;
      this.trackingEventInfo = [
        {type: 'tktrackstart', handler: this.trackStart.bind(this)},
        {type: 'tktrack', handler: this.track.bind(this)},
        {type: 'tktrackend', handler: this.trackEnd.bind(this)},
      ];
      this.enableEvents(this.trackingNode, this.trackingEventInfo, true);
    },
    enableEvents: function(inNode, inEventInfos, inEnable) {
      var m = inEnable ? 'addEventListener' : 'removeEventListener';
      inEventInfos.forEach(function(info) {
        inNode[m](info.type, info.handler);
      })
    },
    trackStart: function(e) {  
      this.animator.stop();
      this.trackInfo = {
        direction: 0,
        dragProp: 'd' + this.direction,
        directionProp: 'dd' + this.direction,
        startPosition: this.position,
        dragScalar: this.dragScale * this.trackingNode[this.direction == 'y' ? 
          'offsetHeight' : 'offsetWidth']
      }
    },
    track: function(e) {
      this.calcTrackDirection(e);
      var info = this.trackInfo;
      var p = info.startPosition + e[info.dragProp] / info.dragScalar;
      this.position = p;
    },
    trackEnd: function(e) {
      var snaps = this.calcSnapPoints(this.position);
      var x = (this.trackInfo.direction * this.dragScale) > 0 ? snaps.end : snaps.start;
      //console.log(info.direction, snaps.start, snaps.end, x);    
      this.animateToPosition(x);
    },
    calcTrackDirection: function(e) {
      var d = e[this.trackInfo.directionProp];
      if (d) {
        this.trackInfo.direction = d > 0 ? 1 : -1;
      }
    }
  };
  // exports
  scope.Timeline = Timeline;
})(window.scrubbing);