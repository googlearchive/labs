(function(scope) {
  scope = scope || {};
  
  var makeTransformValue = function(inState, inProp, inDefault, inUnit) {
    var v = inState[inProp] || inDefault;
    return v + inUnit;
  }
  
  var stateToTransformProp = function(inState, inProp, inDefault, inUnit) {
    var v = '', propX = inProp + 'X', propY = inProp + 'Y', unit = inUnit || '';
    if (inState[inProp]) {
      v = inProp + '(' + makeTransformValue(inState, inProp, inDefault, unit) + ')';
    }
    if (inState[propX]) {
      v += ' ' + propX + '(' + makeTransformValue(inState, propX, inDefault, unit) + ')';
    }
    if (inState[propY]) {
      v += ' ' + propY + '(' + makeTransformValue(inState, propY, inDefault, unit) + ')';
    }
    return v;
  }
  
  var stateToStyle = function(inState, inStyle, inUnit) {
    var kScale = 1;
    var unit = inUnit || '%';
    // transform
    // translate
    var x = inState.x * kScale || 0, y = inState.y * kScale || 0,
      z = inState.z * kScale || 0;
    var translate = 'translate3d(' + x + unit + ',' + y + unit + ','
        + z + 'px)';
    // scale
    var scale = stateToTransformProp(inState, 'scale', 1);
    var rotate = stateToTransformProp(inState, 'rotate', 0, 'deg');
    inStyle.webkitTransform = translate + ' ' + scale + ' ' + rotate;
    // opacity
    if (inStyle.opacity != null) {
      inStyle.opacity = inState.opacity;
    }
    // z-index
    inStyle.zIndex = Math.floor(inState.zIndex);
  }
  
  var Animation = function(inNode, inProps) {
    this.node = inNode;
    this.node.animation = this;
    scope.mixinProps(this, inProps);
    if (!this.position) {
      this.position = 0;
    }
  };
    
  Animation.prototype = {
    unit: '%',
    get timeline() {
      return this._timeline;
    },
    set timeline(inTimeline) {
      if (this.timeline) {
        this.timeline.removeAnimation(this);
      }
      this._timeline = inTimeline;
      inTimeline.addAnimation(this);
    },
    get position() {
      return this._position;
    },
    set position(inValue) {
      this._position = this.noWrap ? Math.max(0, Math.min(inValue, 1)) :
          inValue % 1;
      if (this.keyframes) {
        var o = this.noWrap ? 1 : 0;
        var p =  ((this._position + (this.offset || 0)) * (this.keyframes.length-o)) % 
            this.keyframes.length;
        //console.log(inValue, p);
        this.state = scope.lerp.interpolateVector(this.keyframes, p);
      }
    },
    get state() {
      return this._state;
    },
    set state(inValue) {
      this._state = inValue;
      stateToStyle(this._state, this.node.style, this.unit);
    }
  };
  // exports
  scope.Animation = Animation;
})(window.scrubbing);