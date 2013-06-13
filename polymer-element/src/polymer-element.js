/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
(function(scope) {

  // maps tag names to prototypes
  var registry = {};
  
  // specify element prototype (imperative part of a Polymer element)
  function element(name, prototype) {
    registry[name] = prototype;
  }

  // polymer-element implementation (declarative part of a Polymer element)
  element.prototype = generatePrototype();
  element.prototype.readyCallback = function() {
    // fetch our element name
    var name = this.getAttribute('name');
    // build prototype combining extendee, Polymer base, and named api
    var prototype = generateCustomPrototype(name, this.getAttribute('extends'));
    // declarative features
    desugar(prototype, this);
    // register our custom element
    register(prototype, name);
    // cache useful stuff
    this.prototype = prototype;
    this.ctor = prototype.constructor;
    // questionable backref
    prototype.element = this;
    // reference constructor in a global named by 'constructor' attribute
    publishConstructor(this);
  };

  // register polymer-element
  document.register('polymer-element', element);

  // declarative features
  function desugar(prototype, element) {
    // parse attributes
    scope.parseAttributes(prototype, element);
    // parse declared on-* delegates into imperative form
    //scope.parseHostEvents(element.attributes, prototype);
    // install external stylesheets as if they are inline
    //scope.installSheets(element);
    // transforms to approximate missing CSS features
    //scope.shimStyling(element);
    // allow custom element access to the declarative context
    if (prototype.registerCallback) {
      prototype.registerCallback(element);
    }
  }
  
  // prototype marshaling

  // build prototype combining extendee, Polymer base, and named api
  function generateCustomPrototype(name, extnds) {
    // basal prototype
    var prototype = generateBasePrototype(extnds)
    // mixin registered custom api
    return addNamedApi(prototype, name);
  }

  // build prototype combining extendee, Polymer base, and named api
  function generateBasePrototype(extnds) {
    // create a prototype based on tag-name extension
    var prototype = generatePrototype(extnds)
    // insert base api in inheritance chain (if needed)
    return ensureBaseApi(prototype);
  }
  
  // returns a prototype that chains to <tag> or HTMLElement
  function generatePrototype(tag) {
    return Object.create(!tag ? HTMLElement.prototype :
        // TODO(sjmiles): creating <tag> is likely to have wasteful 
        // side-effects, we need a better way to access this prototype.
        Object.getPrototypeOf(document.createElement(tag)));
  }

  // mix Polymer.base into prototype chain, as needed 
  function ensureBaseApi(prototype) { 
    if (!prototype.PolymerBase) {
      Object.keys(scope.api).forEach(function(n) {
        extend(prototype, scope.api[n]);
      });
      prototype = Object.create(prototype);
    }
    return prototype;
  }

  // mix api registered to 'name' into 'prototype' 
  function addNamedApi(prototype, name) { 
    // combine custom api into prototype
    var api = registry[name];
    if (api) {
      extend(prototype, api);
    }
    return prototype;
  }

  // copy properties from 'api' to 'prototype, with name hinting for 'super'
  function extend(prototype, api) {
    Object.getOwnPropertyNames(api).forEach(function(n) {
      var pd = Object.getOwnPropertyDescriptor(api, n);
      if (pd) {
        Object.defineProperty(prototype, n, pd);
        if (typeof pd.value == 'function') {
          // hint the 'super' engine
          prototype[n].nom = n;
        }
      }
    });
  }

  // registration

  // register 'prototype' to custom element 'name', store constructor 
  function register(prototype, name) { 
    // register the custom type
    var ctor = document.register(name, {
      prototype: prototype
    });
    // constructor shenanigans
    prototype.constructor = ctor;
    return ctor;
  }

  // if a named constructor is requested in element, map a reference
  // to the constructor to the given symbol
  function publishConstructor(element) {
    var symbol = element.getAttribute('constructor');
    if (symbol) {
      window[symbol] = element.ctor;
    }
  }

  // exports

  scope.element = element;

})(Polymer);
