(function() {
  var ANIMATIONS = {
    fadeIn: {
      'opacity': ['0', '1']
    },
    fadeOut: {
      'opacity': ['1', '0']
    },
    slideDown: {
      '-webkit-transform': ['translate3d(0,0,0)', 'translate3d(0,100%,0)'],
      operation: 'add'
    },
    slideUp: {
      '-webkit-transform': ['translate3d(0,0,0)', 'translate3d(0,-100%,0)'],
      operation: 'add'
    },
    slideLeft: {
      '-webkit-transform': ['translate3d(0,0,0)', 'translate3d(-100%, 0,0)'],
      operation: 'add'
    },
    slideRight: {
      '-webkit-transform': ['translate3d(0,0,0)', 'translate3d(100%,0,0)'],
      operation: 'add'
    },
    slideFromLeft: {
      '-webkit-transform': ['translate3d(-100%,0,0)', 'translate3d(0, 0,0)'],
      operation: 'add'
    },
    slideFromRight: {
      '-webkit-transform': ['translate3d(100%,0,0)', 'translate3d(0,0,0)'],
      operation: 'add'
    }
  };

  var DEFAULT_ANIMATION_CLASS = Animation;
  var ANIMATION_CLASSES = {
    'par': ParGroup,
    'seq': SeqGroup
  }

  function animationForType(inType) {
    return ANIMATION_CLASSES[inType] || DEFAULT_ANIMATION_CLASS;
  }

  function isGroupType(inType) {
    return Boolean(ANIMATION_CLASSES[inType]);
  }

  function propertiesForType(inType) {
    return ANIMATIONS[inType] || [];
  }

  var gAnimationPrototype = {
    duration: 0.3,
    fillMode: 'none',
    easing: 'linear',
    iterationCount: 1,
    startDelay: 0,
    type: 'fadeOut',
    target: null,
    animation: null,
    autoplay: false,
    properties: null,
    readyCallback: function() {
      document.utils.attributesToProperties(this);
      this.properties = [];
      this.asyncApply();
    },
    play: function() {
      this.processAsyncApply();
      if (this.animation) {
        if (!this.player) {
          this.player = document.timeline.createPlayer(this.animation);
        }
        this.player.unpause();
        this.player.currentTime = 0;
      }
    },
    asyncApply: function() {
      clearTimeout(this._applying);
      this._applying = setTimeout(this.apply.bind(this), 0);
    },
    processAsyncApply: function() {
      if (this._applying) {
        clearTimeout(this._applying);          
        this._applying = null;
        return this.apply();
      } else {
        return this.animation;
      }
    },
    apply: function() {
      if (this.type) {
        this.properties = propertiesForType(this.type);
      }
      this.animation = null;
      var ctor = animationForType(this.type), group = isGroupType(this.type);
      if (this.target && !group) {
        //console.log('apply', this.target, this.properties, this.timingProps);
        this.animation = new ctor(this.target, this.properties, this.timingProps);
      } else if (group) {
        if (this.target) {
          this.doOnChildren(function(c) {
            c.target = this.target;
          });
        }
        var children = this.childAnimations;
        if (children.length) {
          //console.log('apply', this.target, this.properties, this.timingProps);
          this.animation = new ctor(children, this.timingProps);
        }
      }
      if (this.autoplay && this.animation) {
        this.player = document.timeline.createPlayer(this.animation);
      }
      if (this.animation) {
        this.asyncApplyParent();
      }
      return this.animation;
    },
    addType: function(inType, inProps) {
      ANIMATIONS[inType] = inProps;
    },
    getType: function(inType) {
      return ANIMATIONS[inType];
    },
    durationChanged: function() {
      this.asyncApply();
    },
    fillModeChanged: function() {
      this.asyncApply();
    },
    easingChanged: function() {
      this.asyncApply();
    },
    iterationCountChanged: function() {
      this.asyncApply();
    },
    startDelayChanged: function() {
      this.asyncApply();
    },
    kindChanged: function() {
      this.asyncApply();
    },
    typeChanged: function() {
      this.asyncApply();
    },
    targetChanged: function() {
      this.asyncApply();
    },
    asyncApplyParent: function() {
      var p = this.parentNode;
      if (p.asyncApply) {
        p.asyncApply();
      }
    },
    doOnChildren: function(inFn) {
      Array.prototype.forEach.call(this.children, inFn, this);
    },
    get childAnimations() {
      var list=[];
      Array.prototype.forEach.call(this.children, function(c) {
        c.processAsyncApply();
        if (c.animation) {
          list.push(c.animation);
        }
      });
      return list;
    },
    get timingProps() {
      var props = {
        fillMode: this.fillMode,
        timingFunction: this.easing,
        iterationCount: this.iterationCount,
        startDelay: this.startDelay
      }
      if (!isGroupType(this.type) || this.hasOwnProperty('duration')) {
        props.duration = this.duration;
      }
      return props;
    }
  };
  
  document.utils.setupProperties(gAnimationPrototype);
  
  gAnimationPrototype.__proto__ = HTMLElement.prototype;
  

  document.register('g-animation', {
    prototype: gAnimationPrototype
  });
})();