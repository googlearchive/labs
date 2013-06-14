/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
(function(scope) {

  var PUBLISH = 'publish';
  var ATTRIBUTES = 'attributes';
  var PUBLISHED = '__published';
  var INSTANCE_ATTRIBUTES = '__instance_attributes';
  
  // implements:
  //  `attributes` attribute
  //  `publish` property
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
    var inherited = prototype.__proto__;
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

  // implement cloning of attributes from <element> to instance
  
  function accumulateInstanceAttributes(prototype, element) {
    // our suffix prototype chain
    var inherited = prototype.__proto__;
    // inherit instance attributes
    var attributes = Object.create(inherited[INSTANCE_ATTRIBUTES] || null);
     // merge attributes from element
    var a$ = element.attributes;
    for (var i=0, l=a$.length, a; (i<l) && (a=a$[i]); i++) {
      if (isInstanceAttribute(a.name)) {
        attributes[a.name] = a.value;
      }
    }
    prototype[INSTANCE_ATTRIBUTES] = attributes;
  }

  function isInstanceAttribute(name) {
     return !blackList[name] && name.slice(0,3) !== 'on-';
  }

  var blackList = {name: 1, 'extends': 1, constructor: 1};
  blackList[ATTRIBUTES] = 1;
  
  accumulateInstanceAttributes.blackList = blackList;

  // element api supporting attributes

  var attributes = {
     copyInstanceAttributes: function () {
      var a$ = this[INSTANCE_ATTRIBUTES];
      Object.keys(a$).forEach(function(name) {
        this.setAttribute(name, a$[name]);
      }, this);
    },
    // for each attribute on this, deserialize value to property as needed
    takeAttributes: function() {
      this.attributes.forEach(function(a) {
        this.attributeToProperty(a.name, a.value);
      }, this);
    },
    // if attribute 'name' is mapped to a property, deserialize
    // 'value' into that property
    attributeToProperty: function(name, value) {
      // try to match this attribute to a property (attributes are
      // all lower-case, so this is case-insensitive search)
      var name = this.propertyForAttribute(name);
      if (name) {
        // filter out 'mustached' values, these are to be
        // replaced with bound-data and are not yet values
        // themselves
        if (value.search(scope.bindPattern) >= 0) {
          return;
        }
        // get original value
        var defaultValue = this[name];
        // deserialize Boolean or Number values from attribute
        var value = this.deserializeValue(value, defaultValue);
        // only act if the value has changed
        if (value !== defaultValue) {
          // install new value (has side-effects)
          this[name] = value;
        }
      }
    },
    // return the published property matching name, or undefined
    propertyForAttribute: function(name) {
      // matchable properties must be published
      var properties = Object.keys(this[PUBLISHED]);
      // search for a matchable property
      return properties[properties.map(lowerCase).indexOf(name.toLowerCase())];
    },
    // convert representation of 'stringValue' based on type of 'defaultValue'
    deserializeValue: function(stringValue, defaultValue) {
      return scope.deserializeValue(stringValue, defaultValue);
    }
  };

  var lowerCase = String.prototype.toLowerCase.call.bind(
      String.prototype.toLowerCase);

  // exports

  scope.accumulateInstanceAttributes = accumulateInstanceAttributes;
  scope.parseAttributes = parseAttributes;
  scope.api.attributes = attributes;
  
})(Polymer);
