/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
(function(scope) {

  var PUBLISH = 'publish';
  var ATTRIBUTES = 'attributes';
  var PUBLISHED = '__published';

  // implements:
  //  `attributes` attribute
  //  `publish' property
  function parseAttributes(prototype, element) {
    publishAttributes(prototype, element);
  }

  // process element.attributes.attributes and prototype.publish
  function publishAttributes(prototype, element) {
    publishAttributes(element, prototype);
    publishPublish(prototype);
  }

  function publishAttributes(prototype, element) {
    // our suffix prototype chain
    var inherited = Object.getPrototypeOf(prototype);
    // inherit published properties
    var published = Object.create(inherited[PUBLISHED] || null);
    // merge attribute names from 'attributes' attribute
    var attributes = element.getAttribute(ATTRIBUTES);
    if (attributes) {
      // attributes='a b c' or attributes='a,b,c'
      var names = attributes.split(attributes.indexOf(',') >= 0 ? ',' : ' ');
      // record each name for publishing
      names.forEach(function(p) {
        p = p.trim();
        if (p && !(p in published)) {
          published[p] = null;
        }
      });
    }
    // install 'attributes' as properties on the prototype, 
    // but don't override
    Object.keys(published).forEach(function(p) {
      if (!(p in prototype) && !(p in inherited)) {
        prototype[p] = published[p];
      }
    });
    // store list of published properties on prototype
    prototype[PUBLISHED] = published
  }

  function publishPublish(prototype) {
    // acquire properties published imperatively
    var imperative = prototype[PUBLISH];
    if (imperative) {
      // install imperative properties, overriding defaults
      Object.keys(imperative).forEach(function(p) {
        prototype[p] = imperative[p];
      });
      // combine with other published properties
      Platform.mixin(
        prototype[PUBLISHED],
        imperative
      );
    }
  }

  // element api supporting attributes

  var attributes = {
    // return the published property matching name, or undefined
    propertyForAttribute: function (name) {
      // matchable properties must be published
      var properties = Object.keys(this[PUBLISHED]);
      // search for a matchable property
      return properties[properties.map(lowerCase).indexOf(name.toLowerCase())];
    }
  };

  var lowerCase = String.prototype.toLowerCase.call.bind(
      String.prototype.toLowerCase);

  // exports

  scope.parseAttributes = parseAttributes;
  scope.api.attributes = attributes;
  
})(Polymer);
