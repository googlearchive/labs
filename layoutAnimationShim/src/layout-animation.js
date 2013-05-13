var _DEBUG_CONTROL_POSITIONS = false;

function rectsToTransformValues(desired, current, ignoreScale) {
  return {
    // The center of the object needs to be translated by the delta between desired
    // and current, but we also need to take into account the change of scale.
    tx: desired.left - current.left + (ignoreScale ? 0 : (desired.width - current.width) / 2),
    ty: desired.top - current.top + (ignoreScale ? 0 : (desired.height - current.height) / 2),
    sx: (ignoreScale ? 1 : desired.width / current.width),
    sy: (ignoreScale ? 1 : desired.height / current.height)
  };
}

function transformValuesToCss(values, ignoreScale) {
  return "translate(" + values.tx + "px, " + values.ty + "px)" + (ignoreScale ? "" : 
         " scale(" + values.sx + ", " + values.sy + ")");
}

function rectsToCss(desired, current, ignoreScale) {
  return transformValuesToCss(rectsToTransformValues(desired, current, ignoreScale), ignoreScale);
}

function rectToClip(rect) {
  return "rect(0px, " + rect.width + "px, " + rect.height + "px, 0px)";
} 

function setPosition(target, rect, name) {
  target[name] = rect;
}

function fixTiming(timing) {
  if (typeof timing == "number") {
    timing = {duration: timing};
  }
  timing.fillMode = _DEBUG_CONTROL_POSITIONS ? 'both' : 'none';
  if (_DEBUG_CONTROL_POSITIONS) {
    timing.startDelay = 2;
  }
  return timing;
}
  

function animationToPositionTransform(target, source, destination, current, timing) {
  var startCss = rectsToCss(source, current);
  var endCss = rectsToCss(destination, current);
  console.log(startCss, endCss);

  timing = fixTiming(timing);

  return new Animation(target, {transform: [startCss, endCss], 
                                position: ["absolute", "absolute"]}, timing);
}

function cloneToSize(node, rect) {
  var div = document.createElement("div");
  div.style.position = "absolute";
  div.style.left = rect.left + 'px';
  div.style.top = rect.top + 'px';
  div.style.width = rect.width + 'px';
  div.style.height = rect.height + 'px';
  div.innerHTML = node.innerHTML;
  node.parentElement.appendChild(div);
  return div;
}

function Cleaner(action) {
  this.fired = false;
  this.sample = function(t) {
    if (t == 1 && !this.fired) {
      console.log("fired action");
      action();
      this.fired = true;
    }
  }
}

function animationToPositionFadeOutIn(target, source, destination, current, timing, outTo, inFrom) {

  timing = fixTiming(timing);
  var opacityTiming = {};
  for (d in timing) {
    opacityTiming[d] = timing[d];
  }
  opacityTiming.duration = timing.duration * outTo;
  opacityTiming.fillMode = 'forwards';

  var startClip = rectToClip(source);
  var endClip = rectToClip(destination);
  
  var from = cloneToSize(target, source);
  var startCss = rectsToCss(source, source, true);
  var endCss = rectsToCss(destination, source, true);
  console.log(startClip, endClip);
  var fromAnim = new Animation(from, {transform: [startCss, endCss],
            position: ["absolute", "absolute"], clip: [startClip, endClip]}, timing);
  var fromOpacAnim = new Animation(from, {opacity: ["1", "0"]}, opacityTiming);

  opacityTiming.duration = timing.duration * (1 - inFrom);
  if (opacityTiming.startDelay == undefined) {
    opacityTiming.startDelay = 0;
  }
  opacityTiming.startDelay += timing.duration * inFrom;  
  opacityTiming.fillMode = 'backwards';

  var to = cloneToSize(target, destination);
  var startCss = rectsToCss(source, destination, true);
  var endCss = rectsToCss(destination, destination, true);
  console.log(startCss, endCss);
  var toAnim = new Animation(to, {transform: [startCss, endCss],
            position: ["absolute", "absolute"], clip: [startClip, endClip]}, timing);
  var toOpacAnim = new Animation(to, {opacity: ["0", "1"]}, opacityTiming);

  target.innerHTML = "";

  var containerAnimation = animationToPositionTransform(target, source, destination, current, timing);

  var cleanupAnimation = new Animation(null, new Cleaner(function() {
    target.innerHTML = from.innerHTML;
    from.parentElement.removeChild(from);
    to.parentElement.removeChild(to);
  }), timing);

  return new ParGroup([fromAnim, toAnim, containerAnimation, cleanupAnimation,
    new ParGroup([fromOpacAnim, toOpacAnim], {fillMode: 'none'})]);
  
}

var layoutKeyframes = {};

var transitionable = [];

function registerLayoutKeyframes(name, keyframes) {
  layoutKeyframes[name] = keyframes;
}

function LayoutTransition() {
  this.name = undefined;
  this.duration = 0;
  this.inner = "none";
  this.outer = "layout";
}

LayoutTransition.prototype = {
  setName: function(name) {
    this.name = name;
  },
  setDuration: function(duration) {
    if (duration) {
      this.duration = duration;
    } else {
      this.duration = 0;
    }
  },
  setLayout: function(outer, inner) {
    if (outer == undefined) {
      outer = "layout";
    }
    if (inner == undefined) {
      inner = outer;
    }
    this.outer = outer;
    this.inner = inner;
  }
}

function setLayoutTransition(target, name, duration) {
  if (target.length !== undefined) {
    for (var i = 0; i < target.length; i++) {
      setLayoutTransition(target[i], name, duration);
    }
    return;
  }
  if (target._layout == undefined) {
    target._layout = new LayoutTransition();
  }
  target._layout.setName(name);
  target._layout.setDuration(duration);
  if (transitionable.indexOf(target) == -1) {
    transitionable.push(target);
  }
}

function setLayoutEffect(target, outer, inner) {
  if (target.length !== undefined) {
    for (var i = 0; i < target.length; i++) {
      setLayoutEffect(target[i], outer, inner);
    }
    return;
  }
  if (target._layout == undefined) {
    target._layout = new LayoutTransition();
  }
  target._layout.setLayout(outer, inner);
}

function cloneRect(rect) {
  var result = {};
  result.left = rect.left;
  result.top = rect.top;
  result.width = rect.width;
  result.height = rect.height;
  return result;
}

function rectEquals(rectA, rectB) {
  return rectA.left == rectB.left && rectA.top == rectB.top && rectA.width == rectB.width && rectA.height == rectB.height;
}

function setPositions(target, name) {
  if (target.length !== undefined) {
    for (var i = 0; i < target.length; i++) {
      setPositions(target[i], name);
    }
    return;
  }
  
  var rect = cloneRect(target.getBoundingClientRect());
  setPosition(target, rect, name);
}

// Convert CSS Strings to numbers.
// Maybe its time to think about exposing some of the core CSS emulation functionality of Web Animations?
function v(s) {
  return s.substring(0, s.length - 2);
}

function forceToPosition(element, rect) {
  console.log(rect);
  var style = window.getComputedStyle(element);
  var width = rect.width - v(style.borderLeftWidth) - v(style.borderRightWidth) - v(style.paddingLeft) - v(style.paddingRight);
  var height = rect.height - v(style.borderTopWidth) - v(style.borderBottomWidth) - v(style.paddingTop) - v(style.paddingBottom);
  var left = rect.left - v(style.marginLeft);
  var top = rect.top - v(style.marginTop);
  element.style.left = left + 'px';
  element.style.top = top + 'px';
  element.style.width = width + 'px';
  element.style.height = height + 'px';
  element.style.position = "absolute";
}

function forceToPositions(list) {
  return list.filter(function(listItem) {
    if (rectEquals(listItem._transitionBefore, listItem._transitionAfter)) {
      return false;
    }
    forceToPosition(listItem, listItem._transitionBefore); 
    return true;
  });
}

function buildTree(list) {
  var roots = [];
  for (var i = 0; i < list.length; i++) {
    var current = list[i];
    for (var p = current.parentElement; p != null; p = p.parentElement) {
      if (list.indexOf(p) != -1) {
        current._transitionParent = p;
        if (p._transitionChildren == undefined) {
          p._transitionChildren = [];
        }
        p._transitionChildren.push(current);
        break;
      }
    }
    roots.push(current);
  }
  return roots;
}


function cleanup() {
  for (var i = 0; i < transitionable.length; i++) {
    transitionable[i]._transitionBefore = undefined;
    transitionable[i]._transitionAfter = undefined;
    transitionable[i]._transitionChildren = undefined;
    transitionable[i]._transitionParent = undefined;
  }
}

function transitionThis(action) {
  // record positions before action
  setPositions(transitionable, '_transitionBefore');
  // move to new position
  action();
  // record positions after action
  setPositions(transitionable, '_transitionAfter');
  // put everything back
  movedList = forceToPositions(transitionable);
  // construct transition tree  
  var tree = buildTree(movedList);

  // construct animations
  var parGroup = new ParGroup();
  for (var i = 0; i < tree.length; i++) {
    parGroup.add(
      animationToPositionTransform(tree[i], tree[i]._transitionBefore, tree[i]._transitionAfter, tree[i]._transitionBefore, tree[i]._layout.duration));
  } 
  document.timeline.play(new SeqGroup([
    parGroup,
    new Animation(undefined, new Cleaner(function() {
      for (var i = 0; i < tree.length; i++) {
        // workaround because we can't build animations that transition to empty values
        tree[i].style.left = "";
        tree[i].style.top = "";
        tree[i].style.width = "";
        tree[i].style.height = "";
        // workaround for the fact that fillMode: 'none' doesn't work if the parent has a non-none fillMode.
        tree[i].style.position = "";
        tree[i].style.webkitTransform = "";
      }
    }), 0)]));

  // revert to positioned layout under the hood
  //setTimeout(function() {
    

  // get rid of all the junk
  cleanup();
}
