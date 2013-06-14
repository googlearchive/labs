/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {

  // imports

  var log = window.logFlags || {};

  // magic words
  
  var EVENT_PREFIX = "on-";
  var DELEGATES = '__eventDelegates';
  
  var parseHostEvents = function(prototype, element) {
    // our suffix prototype chain
    var inherited = prototype.__proto__;
    // inherit event delegates
    var delegates = Object.create(inherited[DELEGATES] || null);
    // extract delegates from attributes
    addEventsFromAttributes(element.attributes, delegates);
    // store on prototype
    prototype[DELEGATES] = delegates;
    console.log(delegates, element.attributes.name.value);
  };

  var addEventsFromAttributes = function(attributes, events) {
    for (var i=0, a; a=attributes[i]; i++) {
      if (a.name.slice(0, prefixLength) == EVENT_PREFIX) {
        events[a.name.slice(prefixLength)] = a.value;
      }
    }
  };

  var prefixLength = EVENT_PREFIX.length;
  
  // exports
  
  scope.parseHostEvents = parseHostEvents;

})(Polymer);