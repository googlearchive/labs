/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
(function(scope) {

  // get prototype mapped to node <tag>
  HTMLElement.getPrototypeForTag = function(tag) {
    return !tag ? HTMLElement.prototype :
      // TODO(sjmiles): creating <tag> is likely to have wasteful 
      // side-effects, we need a better way to access the prototype
      Object.getPrototypeOf(document.createElement(tag));
  };

  // returns a prototype that chains to <tag> or HTMLElement
  function generatePrototype(tag) {
    return Object.create(HTMLElement.getPrototypeForTag(tag));
  };

  // copy own properties from 'api' to 'prototype, with name hinting for 'super'
  function extend(prototype, api) {
    // use only own properties of 'api'
    Object.getOwnPropertyNames(api).forEach(function(n) {
      // acquire property descriptor
      var pd = Object.getOwnPropertyDescriptor(api, n);
      if (pd) {
        // clone property via descriptor
        Object.defineProperty(prototype, n, pd);
        // cache name-of-method for 'super' engine
        if (typeof pd.value == 'function') {
          // hint the 'super' engine
          prototype[n].nom = n;
        }
        // TODO(sjmiles): sharing a function only works if the function 
        // only ever has one name
      }
    });
  }

  // we have to flag propagation stoppage for the event dispatcher
  var originalStopPropagation = Event.prototype.stopPropagation;
  Event.prototype.stopPropagation = function() {
    this.cancelBubble = true;
    originalStopPropagation.apply(this, arguments);
  };

  // exports

  scope.api = {
    instance: {},
    declaration: {}
  };
  scope.extend = extend;

})(Polymer);
