var LOCATE_FOUC = false;

/**
 * Returns a transform value (translation in X and Y plus scale in X and Y) that
 * converts a rectangle at current (left, top, width, height) with origin at 
 * origin (x, y) to a rectangle at desired (left, top, width, height). If 
 * ignoreScale is set, then scale contributions are ignored / not generated.
 */
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

/**
 * Returns a CSS representation of the provided transform value (tx, ty, sx, sy).
 */
function transformValuesToCss(values, ignoreScale) {
  return "translate3d(" + values.tx + "px, " + values.ty + "px, 0px)" + (ignoreScale ? "" : 
         " scale(" + values.sx + ", " + values.sy + ")");
}

/**
 * Returns a CSS string representing the transform that
 * converts a rectangle at current (left, top, width, height) with origin at 
 * origin (x, y) to a rectangle at desired (left, top, width, height). If 
 * ignoreScale is set, then scale contributions are ignored / not generated.
 */
function rectsToCss(desired, current, origin, ignoreScale) {
  return transformValuesToCss(rectsToTransformValues(desired, current, origin, ignoreScale), ignoreScale);
}

/**
 * Returns a CSS string representing a clipping rectangle that clips to the
 * width and height of the provided rect.
 */
function rectToClip(rect) {
  return "rect(0px, " + rect.width + "px, " + rect.height + "px, 0px)";
} 

function fixTiming(timing) {
  if (typeof timing == "number") {
    timing = {iterationDuration: timing};
  }
  timing.fillMode = 'none';
  return timing;
}

function animationToPositionLayout(target, from, positions, timing) {
  timing = fixTiming(timing);
  
  var transOrig = origin(from.style.webkitTransformOrigin);
  var cssList = positions.map(function(position) {
    var str = rectsToCss(position, getPosition(target, from.label), transOrig, true);
    return { offset: position.offset, value: str};
  });

  var mkPosList = function(property, list) {
    return list.map(function(input) {
      contentRect = boundingRectToContentRect(target, input);
      var out = {offset: input.offset};
      out.value = contentRect[property] + 'px';
      return out;
    });
  }

  // copy style from initial state to final state. This tries to capture CSS transitions.
  sourceStyle = window.getComputedStyle(from);
  targetStyle = window.getComputedStyle(target);
  for (var i = 0; i < targetStyle.length; i++) {
    var prop = targetStyle[i];
    if (sourceStyle[prop] != targetStyle[prop]) {
      if (["-webkit-transform-origin", "-webkit-perspective-origin", "top", "position", "left", "width", "height", "opacity"].indexOf(prop) == -1) {
        if (prop.indexOf('background') == -1) {
          from.style[prop] = targetStyle[prop];
        }
      }
    }
  }

  return new Animation(from, toStinkyAPI({position: ["absolute", "absolute"],
                                transform: cssList,
                                width: mkPosList('width', positions), 
                                height: mkPosList('height', positions)}), 
                       timing);
}

function origin(str) {
  var arr = str.split('px');
  return {x: Number(arr[0]), y: Number(arr[1])};
}

function toStinkyAPI(dict) {
  var keyframes = {};
  for (var key in dict) {
    for (var i = 0; i < dict[key].length; i++) {
      var item = dict[key][i];
      var offset = i / (dict[key].length - 1);
      if (item.offset !== undefined) {
        offset = item.offset;
        item = item.value;
      }
      if (keyframes[offset] == undefined) {
        keyframes[offset] = {}
      }
      keyframes[offset][key] = item;
    }
  }
  var keyframeList = [];
  for (var offset in keyframes) {
    keyframeList.push([Number(offset), keyframes[offset]]);
  }
  keyframeList.sort();
  return keyframeList.map(function(a) {
    a[1].offset = a[0];
    return a[1];
  });
}

function animationToPositionTransform(target, from, positions, timing) {
  var transOrig = origin(from.style.webkitTransformOrigin);
  var cssList = positions.map(function(position) {
    var str = rectsToCss(position, getPosition(target, from.label), transOrig);
    return {offset: position.offset, value: str};
  });

  timing = fixTiming(timing);

  return new Animation(from, toStinkyAPI({transform: cssList}), timing);
}

function animationToPositionNone(target, from, positions, timing) {
  var transOrig = origin(from.style.webkitTransformOrigin);
  var cssList = positions.map(function(position) {
    var str = rectsToCss(position, getPosition(target, from.label), transOrig, true);
    return { offset: position.offset, value: str};
  });

  timing = fixTiming(timing);
  
  var a = new Animation(from, toStinkyAPI({transform: cssList,
                                position: ["absolute", "absolute"]}), timing);
  return a;
}

function animationToPositionClip(target, from, positions, timing) {
  timing = fixTiming(timing);
  
  var transOrig = origin(from.style.webkitTransformOrigin);
  var cssList = positions.map(function(position) {
    var str = rectsToCss(position, getPosition(target, from.label), transOrig, true);
    return { offset: position.offset, value: str };
  });

  var clipList = positions.map(function(position) {
    var str = rectToClip(position);
    return { offset: position.offset, value: str };
  });

  return new Animation(from, toStinkyAPI({transform: cssList, clip: clipList, position: ["absolute", "absolute"]}), timing);
}

function extractContents(container, copyContents) {
  var fromContents = document.createElement("div");
  fromContents.style.width = container.style.width;
  fromContents.style.height = container.style.height;
  fromContents.style.top = container.style.top;
  fromContents.style.left = container.style.left;
  fromContents.style.position = "absolute";
  fromContents.innerHTML = container.innerHTML;
  if (!copyContents) {
    container.innerHTML = "";
  }
  var targetStyle = container.style;
  for (var i = 0; i < targetStyle.length; i++) {
    var prop = targetStyle[i];
    if (["-webkit-transform-origin", "-webkit-perspective-origin", "top", "position", "left", 
            "width", "height"].indexOf(prop) == -1) {
      if (prop.indexOf("background") == -1) {
        fromContents.style[prop] = targetStyle[prop];
      }
    }
  }
  fromContents.style.borderColor = "rgba(0, 0, 0, 0)";

  return fromContents; 
}

var offsetRE = /^[0-9.]*\%?$/

function Effect() {
  this.isLayout = false;
  this.scaleMode = "none";
  this.blendMode = "none";
  this.explicitNones = 0;
}

Effect.prototype = {
  setLayout: function() {
    console.assert(this.scaleMode == "none" && this.blendMode == "none");
    this.isLayout = true;
  },
  setMode: function(mode) {
    if (mode == 'layout') {
      this.setLayout();
    } else if (mode == 'clip' || mode == 'transform') {
      console.assert(!this.isLayout);
      this.scaleMode = mode;
    } else if (mode.substr(0, 4) == 'fade') {
      console.assert(!this.isLayout);
      this.blendMode = 'fade';
      if (mode == 'fade' || mode == 'fade-in') {
        this.fadeInParam = 1;
      }
      if (mode == 'fade' || mode == 'fade-out') {
        this.fadeOutParam = 0;
      }
      if (mode.substr(0, 7) == 'fade-to') {
        console.assert(this.fadeInParam === undefined && this.fadeOutParam === undefined);
        var modes = mode.substr(5).split(',');
        this.fadeInParam = offsetToNumber(modes[0].trim());
        this.fadeOutParam = offsetToNumber(modes[1].split(')')[0].trim());
      }
    } else if (this.explicitNones == 0) {
      console.assert(this.scaleMode == 'none' || this.blendMode == 'none');
    } else {
      console.assert(this.scaleMode == 'none' && this.blendMode == 'none' && this.explicitNones == 1);
    }
  }
}

function interp(a, b, p) {
  return a * (1 - p) + b * p;
}

function interpPosition(a, b, f) {
  var p = (f - a.offset) / (b.offset - a.offset);
  return {
    offset: f,
    top: interp(a.top, b.top, p),
    left: interp(a.left, b.left, p),
    width: interp(a.width, b.width, p),
    height: interp(a.height, b.height, p)
  };
}

function clone(a) {
  return {
    offset: a.offset,
    top: a.top,
    left: a.left,
    width: a.width,
    height: a.height
  };
}

function positionSubList(start, end, positionList) {
  var sublist = [];
  for (var i = 0; i < positionList.length; i++) {
    if (positionList[i].offset < start && positionList[i + 1].offset > start) {
      sublist.push(interpPosition(positionList[i], positionList[i + 1], start));
    } 
    if (positionList[i].offset >= start && positionList[i].offset <= end) {
      sublist.push(clone(positionList[i]));
    }
    if (positionList[i].offset < end && positionList[i + 1].offset > end) {
      sublist.push(interpPosition(positionList[i], positionList[i + 1], end));
    }
    if (positionList[i].offset > end) {
      break;
    }
  }

  for (var i = 0; i < sublist.length; i++) {
    sublist[i].offset = (sublist[i].offset - start) / (end - start);
  }
  return sublist;
}

function offsetToNumber(value) {
  if (value.indexOf('%') != -1) {
    return Number(value.slice(0, value.length - 1)) / 100;
  }
  return Number(value);
}

function prettyPrint(anim) {
  function spaces(d) {
    var s = '';
    for (var i = 0; i < d; i++) {
      s += ' ';
    }
    return s;
  };

  function prettyPrint_(anim, depth) {
    if (anim instanceof SeqGroup) {
      name = 'SeqGroup';
    } else if (anim instanceof ParGroup) {
      name = 'ParGroup';
    } else {
      name = 'Animation';
    }
    var arrow = '';
    switch (anim.specified.fillMode) {
      case 'forwards':
        arrow = '->';
        break;
      case 'backwards':
        arrow = '<-';
        break;
      case 'both':
        arrow = '<->';
        break;
      case 'none':
        arrow = '|';
        break;
      default:
        arrow = '?';
        break;
    }
    console.log(spaces(depth) + name + ': ' + anim.activeDuration + 's ' + arrow);
    if (anim.children) {
      for (var i = 0; i < anim.children.length; i++) {
        prettyPrint_(anim.children[i], depth + 2);
      }
    }
  };
  prettyPrint_(anim, 0);
}
    

function generateAnimation(element, positionList) {

  var effect = element._layout.effect;
  var duration = element._layout.duration;
    
  var effectList = effect.split(' ');
  var effectResult = [];
  var start = 0;
  var effect = new Effect();
  for (var i = 0; i < effectList.length; i++) {
    if (offsetRE.exec(effectList[i]) != null) {
      var stop = offsetToNumber(effectList[i]);

      if (start == stop) {
        continue;
      }
      else {
        effectResult.push({start: start, end: stop, effect: effect});
        start = stop;
        effect = new Effect();
        continue;
      }
    }
    effect.setMode(effectList[i]);
  }

  if (start != 1) {
    effectResult.push({start: start, end: 1, effect: effect});
  }

  var seq = new SeqGroup();
  var lastWasLayout = true;

  var copies = [getCopy(element, '_transitionBefore')];
  var fromCopy = copies[0];
  var fromOpacity = 1;
  var toOpacity = 0;

  var newStates = [];

  var anims = undefined;
  for (var i = 0; i < effectResult.length; i++) {
    var start = effectResult[i].start;
    var end = effectResult[i].end;
    var effect = effectResult[i].effect;
    var sublist = positionSubList(start, end, positionList);
    if (effect.isLayout) {
      anims = [];
      copies.forEach(function(copy) {
        var anim = animationToPositionLayout(element, copy, sublist, duration * (end - start));
        anims.push(anim);
      });
      seq.append(new ParGroup(anims, {fillMode: 'forwards'}));
      lastWasLayout = true;
    } else {
      if (effect.blendMode != 'none') {
        var group = new SeqGroup([], {fillMode: 'forwards'});
        var par = new ParGroup([], {fillMode: 'forwards'});
        par.append(group);
        seq.append(par);
        if (end == 1) {
          var newState = '_transitionAfter';
        } else {
          var newState = '_at_' + end;
          generateCopyAtPosition(element, sublist[sublist.length - 1], newState);
        }
        newStates.push(newState);
        toCopy = getCopy(element, newState);
        copies.push(toCopy);
        toCopy.style.opacity = '0';
        showCopy(element, newState);
        par.append(new Animation(fromCopy, [{opacity: fromOpacity + ''}, {opacity: effect.fadeOutParam + ''}],
          {fillMode: 'forwards', iterationDuration: duration * (end - start)}));
        par.append(new Animation(toCopy, [{opacity: toOpacity + ''}, {opacity: effect.fadeInParam + ''}],
          {fillMode: 'forwards', iterationDuration: duration * (end - start)}));

      } else {
        var group = seq;
      }
      if (!lastWasLayout) {
        var newList = [clone(sublist[0]), clone(sublist[0])];
        newList[0].offset = 0;
        newList[1].offset = 1;
        anims = [];
        copies.forEach(function(copy) {
          var anim = animationToPositionLayout(element, copy, newList, 0);
          anims.push(anim);
        });
        group.append(new ParGroup(anims, {fillMode: 'forwards'}));
      }
      // this will pick up either the previous layout or the inserted layout and fix it
      // with forward fill.
      if (anims) {
        anims.forEach(function(anim) { anim.specified.fillMode = 'forwards'; });
        anims = undefined;
      }
      lastWasLayout = false;
      switch(effect.scaleMode) {
        case 'none':
          var f = animationToPositionNone;
          break;
        case 'transform':
          var f = animationToPositionTransform;
          break;
        case 'clip':
          var f = animationToPositionClip;
          break;
      }
      var copyAnims = []
      copies.forEach(function(copy) { copyAnims.push(f(element, copy, sublist, duration * (end - start))); });
      group.append(new ParGroup(copyAnims));
    }
  }

  seq.onend = function(e) {
    hideCopy(element, '_transitionAfter');
    newStates.forEach(function(state) { 
      hideCopy(element, state);
      removeCopy(element, state);
    });
  }

  return seq;
}

function cloneToSize(node, rect, hide) {
  var div = document.createElement("div");
  var nodeStyle = window.getComputedStyle(node);
  div.setAttribute("style", nodeStyle.cssText);
  if (hide) {
    div.style.opacity = "0";
  }
  div.style.position = "absolute";
  div.style.left = rect.left + 'px';
  div.style.top = rect.top + 'px';
  div.style.width = rect.width + 'px';
  div.style.height = rect.height + 'px';
  div.innerHTML = node.innerHTML;
  if (hide) {
    // NB: This is a hacky way to put to containers before from contents.
    node.shadow.parent.insertBefore(div, node.shadow.parent.children[2]);
  } else {
    node.shadow.parent.appendChild(div);
  }
  return div;
}

function Cleaner(action) {
  this.fired = false;
  this.action = action;
  this.sample = function(t) {
    if (t == 1 && !this.fired) {
      this.action();
      this.fired = true;
    }
  }.bind(this);
}

function cleaner(action, timing) {
  return new Animation(null, new Cleaner(action), timing);
}

//========================

var layoutKeyframes = {};

var transitionable = [];

function registerLayoutKeyframes(name, keyframes) {
  layoutKeyframes[name] = keyframes;
}

function LayoutTransition() {
  this.name = undefined;
  this.duration = 0;
  this.effect = "layout";
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
  setEffect: function(effect) {
    if (effect == undefined) {
      effect = "layout";
    }
    this.effect = effect;
  }
}

function setLayoutTransition(target, name, duration) {
  if (target.length !== undefined) {
    for (var i = 0; i < target.length; i++) {
      setLayoutTransition(target[i], name, duration);
    }
    return;
  }

  if (target.classList.contains("_layoutAnimationContentSnapshot")) {
    console.error("You're attempting to set a layout transition on a content snapshot." +
      " This shim creates content snapshots as divs attached to the same parent as the content" +
      " being snapshotted. You're probably using a selector that selects 'div' rather than" +
      " something more specific.");
    return;
  }

  if (name == undefined) {
    if (target._layout) {
      target._layout = undefined;
      transitionable.splice(transitionable.indexOf(target), 1);
      target.removeAttribute('isTransitionable');
    }
    return;
  }


  target.setAttribute('isTransitionable', 'isTransitionable');
  if (target._layout == undefined) {
    target._layout = new LayoutTransition();
  }
  target._layout.setName(name);
  target._layout.setDuration(duration);
  if (transitionable.indexOf(target) == -1) {
    transitionable.push(target);
  }
}

function setLayoutEffect(target, effect) {
  if (target.length !== undefined) {
    for (var i = 0; i < target.length; i++) {
      setLayoutEffect(target[i], effect);
    }
    return;
  }
  if (target._layout == undefined) {
    target._layout = new LayoutTransition();
  }
  target._layout.setEffect(effect);
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
  
  var rect = sensePosition(target);
  setPosition(target, rect, name);
}

function sensePosition(target) {
  var rect = cloneRect(target.getBoundingClientRect());
  var parent = target.parentElement;
  while (parent) {
    var style = getComputedStyle(parent);
    if (style.position == 'absolute' || style.position == 'relative') {
      break;
    }  
    parent = parent.parentElement;
  }
  if (parent) {
    var parentRect = parent.getBoundingClientRect();
    rect.top -= parentRect.top;
    rect.left -= parentRect.left;
  }
  return rect;
}


// Convert CSS Strings to numbers.
// Maybe its time to think about exposing some of the core CSS emulation functionality of Web Animations?
function v(s) {
  return Number(s.substring(0, s.length - 2));
}

function boundingRectToContentRect(element, rect) {
  var style = window.getComputedStyle(element);
  var width = rect.width - v(style.borderLeftWidth) - v(style.borderRightWidth) - v(style.paddingLeft) - v(style.paddingRight);
  var height = rect.height - v(style.borderTopWidth) - v(style.borderBottomWidth) - v(style.paddingTop) - v(style.paddingBottom);
  var left = rect.left - v(style.marginLeft);
  var top = rect.top - v(style.marginTop);
  return {width: width, top: top, left: left, height: height};
}

function boundingRectToReplacementRect(element, rect) {
  var style = window.getComputedStyle(element);
  var width = rect.width + v(style.marginLeft) + v(style.marginRight);
  var height = rect.height + v(style.marginTop) + v(style.marginBottom);
  var left = rect.left - v(style.marginLeft);
  var top = rect.top - v(style.marginTop);
  return {width: width, top: top, left: left, height: height}; 
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
    if (p == null) {
      roots.push(current);
    }
  }
  return roots;
}


function cleanup() {
  for (var i = 0; i < transitionable.length; i++) {
    transitionable[i]._transitionChildren = undefined;
    transitionable[i]._transitionParent = undefined;
  }
}

function positionListFromKeyframes(keyframes, element) {
  var positions = keyframes.slice();
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

function makePositionListRelative(list, parentList) {
  var result = []
  for (var i = 0; i < list.length; i++) {
    result.push({
      top: list[i].top + parentList[i].top,
      left: list[i].left + parentList[i].left,
      width: list[i].width,
      height: list[i].height,
      offset: list[i].offset});
  }
  return result;
}

// Transition the provided action.
//
// Overview:
// All potentially transitionable content is stored in the transitionable list.
// Each element in this list has initial position marked and a copy created.
// Additionally, a shadow DOM tree is created for each container of a transitionable
// element. Details of this tree are stored on the transitionable elements themselves,
// in a member variable called shadow:
// {
//   root: root of the shadow DOM tree
//   parent: root of the element's tree
//   content: root of the element's content exposure
//   from: initial created copy
// }
// The initial position is stored in a member variable called _transitionBefore
// TODO: Is the initial position needed any more?
// As part of the process of creating a copy, the content is hidden by setting
// a wrapping div in the shadow DOM to opacity: 0.
//
// The action is then executed. This updates the content to its new position,
// but the change is not visible on-screen. The new position is captured into
// element._transitionAfter, and a list of moved elements is generated.
// Additionally, the content node is removed from the shadow DOM to prevent 
// further interaction from the actual content.
//
// Each different transition type has a different approach to generating the
// transition effect, but essentially transform, layout and none operate on the
// created copy, while transfade and crossfade need to create an aditional copy
// of the to state. This is performed in the animation generation functions directly.
function transitionThis(action) {
  // construct transition tree  
  var tree = buildTree(transitionable);
  
  // record positions before action
  transitionable.map(function(element) { ensureCopy(element, '_transitionBefore'); });

  // move to new position
  action();

  // record positions after action
  transitionable.map(function(element) {
    ensureCopy(element, '_transitionAfter'); 
    element.style.opacity = '0';
    showCopy(element, '_transitionBefore');
  });

  // construct animations
  var parGroup = new ParGroup();

  function processList(list) {
    if (!list) {
      return;
    }

    for (var i = 0; i < list.length; i++) {

      var keyframes = layoutKeyframes[list[i]._layout.name];
      var positionList = positionListFromKeyframes(keyframes, list[i]);
     
      if (list[i]._transitionParent) {
        //positionList = makePositionListRelative(positionList, list[i]._transitionParent._transitionPositionList);
      }
      console.log(list[i].id, JSON.stringify(positionList));

      list[i]._transitionPositionList = [];
      for (var j = 0; j < positionList.length; j++) {
        list[i]._transitionPositionList.push({left: positionList[j].left, top: positionList[j].top});
      }
      
      parGroup.append(generateAnimation(list[i], positionList)); 

      processList(list[i]._transitionChildren);
    }
  }

  processList(tree);

  parGroup.onend = function() {
    for (var i = 0; i < tree.length; i++) {
      // workaround because we can't build animations that transition to empty values
      tree[i].style.left = "";
      tree[i].style.top = "";
      tree[i].style.width = "";
      tree[i].style.height = "";
      tree[i].style.position = "";
    }
    for (var i = 0; i < transitionable.length; i++) {
      transitionable[i].style.opacity = "";
      hideCopy(transitionable[i], '_transitionBefore');
      removeCopy(transitionable[i], '_transitionBefore');
      removeCopy(transitionable[i], '_transitionAfter');
    }
  };

  if (LOCATE_FOUC) {
    //setTimeout(parGroup.onend, 1000);
  } else {
    document.timeline.play(parGroup);
  }
  // get rid of all the junk
  cleanup();
}

function clearPosition(target, name) {
  target[name] = undefined;
}

function setPosition(target, rect, name) {
  target[name] = rect;
}

function getPosition(target, name) {
  return target[name];
}

function cacheCopy(element, state, copy) {
  if (!(element._copyCache)) {
    element._copyCache = {}
  }
  element._copyCache[state] = copy;
}

function removeCopy(element, state) {
  if (!(element._copyCache)) {
    return;
  }
  element._copyCache[state] = undefined;
  clearPosition(element, state);
}

function getCopy(element, state) {
  if (!(element._copyCache)) {
    return;
  }
  return element._copyCache[state];
}

function generateCopy(element, state) {
  var rect = sensePosition(element);
  generateCopyAtPosition(element, rect, state);
}

function generateCopyAtPosition(element, rect, state) {
  if (element._transitionParent) {
    // TODO: Do we still need to do this?
    var parent = element.parentElement;
    while (parent && !parent._layout) {
      var style = getComputedStyle(parent);
      if (style.position == "relative" || style.position == "absolute") {
        fromPosition.left += parent.offsetLeft;
        fromPosition.top += parent.offsetTop;
      }
      parent = parent.parentElement;
    }
   
  }

  
  var fromPosition = boundingRectToContentRect(element, rect);
  console.log('cloning ' + element.id + ' for state ' + state + ' as rect ' + JSON.stringify(rect));
  var from = cloneElementToSize(element, fromPosition);

  setPosition(element, rect, state);
  from.label = state;
  from.classList.add(state)
  cacheCopy(element, state, from);
}

function ensureCopy(element, state) {
  if (getCopy(element, state)) {
    return;
  }
  generateCopy(element, state);
}

function showCopy(element, state) {
  var copy = getCopy(element, state);
 
  var insertion = element;
  while (insertion._transitionParent) {
    insertion = insertion._transitionParent;
  }

  insertion.parentElement.appendChild(copy);
  return copy;
}

function hideCopy(element, state) {
  var copy = getCopy(element, state);
  if (!copy || !copy.parentElement) {
    return;
  }
  copy.parentElement.removeChild(copy);
}

function cloneElementToSize(node, rect, hide) {
  var div = document.createElement("div");
  var nodeStyle = window.getComputedStyle(node);
  div.setAttribute("style", nodeStyle.cssText);
  if (hide) {
    div.style.opacity = "0";
  }
  div.style.position = "absolute";
  div.style.left = rect.left + 'px';
  div.style.top = rect.top + 'px';
  div.style.width = rect.width + 'px';
  div.style.height = rect.height + 'px';
  div.innerHTML = node.innerHTML;

  var transitionChildren = node.querySelectorAll("[isTransitionable]");
  var transitionMirrors = div.querySelectorAll("[isTransitionable]");
  for (var i = 0; i < transitionChildren.length; i++) {
    var child = transitionChildren[i];
    var mirror = transitionMirrors[i];
    var style = getComputedStyle(child);
    var newDiv = document.createElement("div");
    newDiv.setAttribute('style', "top: " + style.top + "; left: " + style.left + "; width: " + style.width + "; height: " + style.height);
    mirror.parentElement.replaceChild(newDiv, mirror);
  }

  div.classList.add("_layoutAnimationContentSnapshot");

  return div;
}
