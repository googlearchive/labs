/*!
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

function TkGestureEvent(inType, inDict) {
  var e = document.createEvent('UIEvent');
  if (Object.__proto__) {
    e.__proto__ = TkGestureEvent.prototype;
    e.initGestureEvent(inType, inDict);
  } else {
    TkGestureEvent.prototype.initGestureEvent.call(e, inType, inDict);
  }
  return e;
}

TkGestureEvent.prototype.__proto__ = UIEvent.prototype;

TkGestureEvent.prototype.initGestureEvent = function(inType, inDict) {
  var props = {
    bubbles: true,
    cancelable: true,
    view: null,
    detail: null,
  };

  for (var k in inDict) {
    props[k] = inDict[k];
  }

  this.initUIEvent(inType, props.bubbles, props.cancelable, props.view, props.detail);

  for (var k in props) {
    this[k] = props[k];
  }
}
