var _DEBUG_CONTROL_POSITIONS = false;

function rectsToTransformValues(desired, current, origin, ignoreScale) {
  var sx = (ignoreScale ? 1 : desired.width / current.width);
  var sy = (ignoreScale ? 1 : desired.height / current.height);
  return {
    tx: desired.left - current.left - origin.x * (1 - sx),
    ty: desired.top - current.top - origin.y * (1 - sy),
    sx: sx,
    sy: sy
  };
}

function transformValuesToCss(values, ignoreScale) {
  return "translate3d(" + values.tx + "px, " + values.ty + "px, 0px)" + (ignoreScale ? "" : 
         " scale(" + values.sx + ", " + values.sy + ")");
}

function rectsToCss(desired, current, origin, ignoreScale) {
  return transformValuesToCss(rectsToTransformValues(desired, current, origin, ignoreScale), ignoreScale);
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
  
function animationToPositionLayout(target, positions, current, timing) {
  timing = fixTiming(timing);
   
  var mkPosList = function(property, list) {
    return list.map(function(input) {
      contentRect = boundingRectToContentRect(target, input);
      var out = {offset: input.offset};
      out.value = contentRect[property] + 'px';
      return out;
    });
  }

  return new Animation(target, {position: ["absolute", "absolute"],
                                left: mkPosList('left', positions),
                                top: mkPosList('top', positions),
                                width: mkPosList('width', positions),
                                height: mkPosList('height', positions)}, 
                       timing); 
}

function origin(element) {
  var str = getComputedStyle(element).webkitTransformOrigin;
  var arr = str.split('px');
  return {x: Number(arr[0]), y: Number(arr[1])};
}

function animationToPositionTransform(target, positions, current, timing) {

  var cssList = positions.map(function(position) {
    var str = rectsToCss(position, current, origin(target));
    return {offset: position.offset, value: str};
  });

  timing = fixTiming(timing);

  return new Animation(target, {transform: cssList, position: ["absolute", "absolute"]}, timing);
}

function animationToPositionNone(target, positions, current, timing) {

  var cssList = positions.map(function(position) {
    var str = rectsToCss(position, current, origin(target), true);
    return { offset: position.offset, value: str};
  });

  timing = fixTiming(timing);
  
  return new Animation(target, {transform: cssList,
                                position: ["absolute", "absolute"]}, timing);
}

function animationToPositionFadeOutIn(outTo, inFrom) {
  return function(target, positions, current, timing) {
    timing = fixTiming(timing);
    var opacityTiming = {};
    for (d in timing) {
      opacityTiming[d] = timing[d];
    }
    opacityTiming.duration = timing.duration * outTo;
    opacityTiming.fillMode = 'forwards';

    var cssList = positions.map(function(position) {
      var str = rectsToCss(position, positions[0], origin(target), true);
      return { offset: position.offset, value: str};
    });
    
    var fromAnim = new Animation(target, {transform: cssList,
            position: ["absolute", "absolute"]}, timing);
    var fromOpacAnim = new Animation(target, {opacity: ["1", "0"]}, opacityTiming);

    opacityTiming.duration = timing.duration * (1 - inFrom);
    if (opacityTiming.startDelay == undefined) {
      opacityTiming.startDelay = 0;
    }
    opacityTiming.startDelay += timing.duration * inFrom;  
    opacityTiming.fillMode = 'backwards';

    var cssList = positions.map(function(position) {
      var str = rectsToCss(position, positions[positions.length - 1], origin(target), true);
      return { offset: position.offset, value: str};
    });

    var toPosition = boundingRectToContentRect(target, positions[positions.length - 1]);
    var to = cloneToSize(target, toPosition);

    var toAnim = new Animation(to, {transform: cssList,
              position: ["absolute", "absolute"]}, timing);
    var toOpacAnim = new Animation(to, {opacity: ["0", "1"]}, opacityTiming);

    timing.fillMode = 'forwards';
    var cleanupAnimation = new Animation(null, new Cleaner(function() {
      to.parentElement.removeChild(to);
    }), timing);
    
    return new ParGroup([fromAnim, toAnim, cleanupAnimation, 
      new ParGroup([fromOpacAnim, toOpacAnim], {fillMode: 'none'})]);
  }
}

function animationToPositionTransfade(target, positions, current, timing) {
  timing = fixTiming(timing);

  var cssList = positions.map(function(position) {
    var str = rectsToCss(position, positions[0], origin(target));
    return { offset: position.offset, value: str};
  });
    
  var fromAnim = new Animation(target, {transform: cssList,
          position: ["absolute", "absolute"]}, timing);
  var fromOpacAnim = new Animation(target, {opacity: ["1", "0"]}, timing);

    var cssList = positions.map(function(position) {
      var str = rectsToCss(position, positions[positions.length - 1], origin(target));
      return { offset: position.offset, value: str};
    });

    var toPosition = boundingRectToContentRect(target, positions[positions.length - 1]);
    var to = cloneToSize(target, toPosition);

    var toAnim = new Animation(to, {transform: cssList,
              position: ["absolute", "absolute"]}, timing);
    var toOpacAnim = new Animation(to, {opacity: ["0", "1"]}, timing);

    timing.fillMode = 'forwards';
    var cleanupAnimation = new Animation(null, new Cleaner(function() {
      to.parentElement.removeChild(to);
    }), timing);
    
    return new ParGroup([fromAnim, toAnim, cleanupAnimation, 
      new ParGroup([fromOpacAnim, toOpacAnim], {fillMode: 'none'})]);
  }


function cloneToSize(node, rect) {
  var div = document.createElement("div");
  div.style.opacity = "0";
  nodeStyle = window.getComputedStyle(node);
  div.setAttribute("style", nodeStyle.cssText);
  div.style.opacity = "0";
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

function animationToPositionFadeOutIn2(target, source, destination, current, timing, outTo, inFrom) {

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

function boundingRectToContentRect(element, rect) {
  var style = window.getComputedStyle(element);
  var width = rect.width - v(style.borderLeftWidth) - v(style.borderRightWidth) - v(style.paddingLeft) - v(style.paddingRight);
  var height = rect.height - v(style.borderTopWidth) - v(style.borderBottomWidth) - v(style.paddingTop) - v(style.paddingBottom);
  var left = rect.left - v(style.marginLeft);
  var top = rect.top - v(style.marginTop);
  return {width: width, top: top, left: left, height: height};
}
  

function forceToPosition(element, rect) {
  rect = boundingRectToContentRect(element, rect);
  element.style.left = rect.left + 'px';
  element.style.top = rect.top + 'px';
  element.style.width = rect.width + 'px';
  element.style.height = rect.height + 'px';
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

function positionListFromKeyframes(keyframes, element) {
  positions = keyframes.slice();
  positions.sort(function(a, b) {
    if (a.offset > b.offset) {
      return 1;
    }
    if (a.offset < b.offset) {
      return -1;
    }
    return 0;
  });
  if (positions[0].offset != 0) {
    throw "NoOffsetAt0";
  }
  if (positions[positions.length - 1].offset != 1) {
    throw "NoOffsetAt1";
  }

  var before = element._transitionBefore;
  var after = element._transitionAfter;

  var properties = ["left", "top", "width", "height"];

  for (var i = 0; i < positions.length; i++) {
    for (var j = 0; j < properties.length; j++) {
      var property = properties[j];
      var layoutProperty = 'layout' + properties[j][0].toUpperCase() + properties[j].slice(1);
      if (positions[i].properties[layoutProperty] == "from()") {
        positions[i][property] = before[property];
      } else if (positions[i].properties[layoutProperty] == "to()") {
        positions[i][property] = after[property];
      } else {
        positions[i][property] = v(positions[i].properties[layoutProperty]);
      }
    }
  }

  return positions;
}

function transitionThis(action) {
  // record positions before action
  setPositions(transitionable, '_transitionBefore');
  // move to new position
  action();
  // record positions after action
  setPositions(transitionable, '_transitionAfter');
  // put everything back
  // note that we don't need to do this for all transition types, but
  // by doing it here we avoid a layout flicker.
  movedList = forceToPositions(transitionable);
  // construct transition tree  
  var tree = buildTree(movedList);

  // construct animations

  var parGroup = new ParGroup();
  for (var i = 0; i < tree.length; i++) {
    switch(tree[i]._layout.outer) {
      case 'transform':
        generator = animationToPositionTransform;
        break;
      case 'none':
        generator = animationToPositionNone;
        break;
      case 'crossfade':
        generator = animationToPositionFadeOutIn(1, 0);
        break;
      case 'transfade':
        generator = animationToPositionTransfade;
        break;
      default:
        generator = animationToPositionLayout;
        break;
    }
    var keyframes = layoutKeyframes[tree[i]._layout.name];
    var positionList = positionListFromKeyframes(keyframes, tree[i]);
    parGroup.add(
        generator(tree[i], positionList, tree[i]._transitionBefore, tree[i]._layout.duration));
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
      }
    }), 0)]));

  // revert to positioned layout under the hood
  //setTimeout(function() {
    

  // get rid of all the junk
  cleanup();
}
