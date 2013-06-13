/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
(function(scope) {

  // imports

  var log = window.logFlags || 0;

  // use this MDV syntax
    
  var SYNTAX = 'MDV';

  HTMLTemplateElement.syntax[SYNTAX] = new MDVSyntax();

  // element api supporting mdv

  var mdv = {
    instanceTemplate: function(template) {
      return template.createInstance(this, SYNTAX);
    },
    // custom MDV entry point (overrides [at least] `HTMLElement.prototype.bind`)
    bind: function(name, model, path) {
      // is the bind target a published property?
      var property = this.propertyForAttribute(name);
      if (property) {
        // use n-way Polymer binding
        this.bindProperty(property, model, path);
        // bookkeep the binding
        registerBinding(this, property, path);
      } else {
        this.super(arguments);
        // HTMLElement.prototype.bind.apply(this, arguments);
      }
    },
    // custom MDV entry point (overrides [at least] `HTMLElement.prototype.unbind`)
    unbind: function(name) {
      if (this.unbindProperty(this, 'binding', name)) {
        // bookkeep the binding
        unregisterBinding(this, name);
      } else {
        this.super(arguments);
        //HTMLElement.prototype.unbind.apply(this, arguments);
      }
    },
    asyncUnbindAll: function() {
      if (!this._unbound) {
        log.bind && console.log('asyncUnbindAll', this.localName);
        this._unbindAllJob = this.job(this._unbindAllJob, this.unbindAll, 100);
      }
    },
    unbindAll: function() {
      if (!this._unbound) {
        this.unbindAllProperties();
        this.super(); //HTMLElement.prototype.unbindAll.apply(this, arguments);
        // unbind shadowRoot, whee
        //unbindNodeTree(this.shadowRoot, true);
        this._unbound = true;
      }
    }
  };

  // bookkeep bindings for reflection

  var bindings = new SideTable();
  
  function registerBinding(element, name, path) {
    var b$ = bindings.get(element);
    if (!b$) {
      bindings.set(element, b$ = {});
    }
    b$[name.toLowerCase()] = path;   
  }
  
  function unregisterBinding(element, name) {
    var b$ = bindings.get(element);
    if (b$) {
      delete b$[name.toLowerCase()];
    }
  }

  // exports

  scope.api.mdv = mdv;

  //scope.registerBinding = registerBinding;
  //scope.unregisterBinding = unregisterBinding;
  
})(Polymer);
