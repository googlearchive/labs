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
    var name = this.getAttribute('name');
    var extnds = this.getAttribute('extends');
    // build prototype combining extendee, Polymer base, and named api
    var prototype = generateCustomPrototype(name, extnds);
    // declarative features
    decorate(prototype, this);
    // register our custom element
    register(prototype, name);
    // cache useful stuff
    this.prototype = prototype;
    this.ctor = prototype.constructor;
    // reference constructor in a global named by 'constructor' attribute
    publishConstructor(this);
    // questionable backref
    prototype.element = this;
  };

  // register polymer-element
  document.register('polymer-element', element);

  // build prototype combining extendee, Polymer base, and named api
  function generateCustomPrototype(name, extnds) {
    // create a basal prototype
    // mix registered custom api into prototype
    return addNamedApi(generateBasePrototype(extnds), name);
  }

  // build prototype combining extendee, Polymer base, and named api
  function generateBasePrototype(extnds) {
    // create a prototype based on tag-name extension
    // insert base api in inheritance chain (if needed)
    return ensureBaseApi(generatePrototype(extnds));
  }
  
  // returns a prototype that chains to one of element `tag` 
  // or HTMLElement
  function generatePrototype(tag) {
    return Object.create(!tag ? HTMLElement.prototype :
        Object.getPrototypeOf(document.createElement(tag)));
  }

  // mix Polymer.base into prototype chain, as needed 
  function ensureBaseApi(prototype) { 
    if (!prototype.PolymerBase) {
      extend(prototype, Polymer.base);
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

  function decorate(prototype, element) {
  }

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
