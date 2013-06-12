/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
(function(scope) {

  var base = {
    PolymerBase: true,
    super: Polymer.super,
    // user entry point for constructor-like initialization
    ready: function() {
      this.super();
    },
    // system entry point, do not override
    readyCallback: function() {
      this.parseElements(this.__proto__);
      this.ready();
    },
    // recursive ancestral <element> initialization, oldest first
    parseElements: function(p) {
      if (p && p.element) {
        this.parseElements(p.__proto__);
        p.parseElement.call(this, p.element);
      }
    },
    // parse input <element> as needed, override for custom behavior
    parseElement: function(elementElement) {
      var t = elementElement.querySelector('template');
      if (t) {
        this.shadowFromTemplate(t); 
      }
    },
    // utility function that creates a shadow root from a <template>
    shadowFromTemplate: function(template) {
      this.createShadowRoot().appendChild(template.createInstance());
    }
  };
  
  // name the base for dev tools
  function PolymerBase() {};
  base.constructor = scope.Base = PolymerBase;
  
  // exports

  scope.base = base;
  
})(Polymer);
