/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
(function(scope) {
  
  // imports

  var log = window.logFlags || {};
  
  var properties = {
    bindProperty: function(property, model, path) {
      // apply Polymer two-way reference binding
      var observer = scope.bindProperties(this, property, model, path);
      // bookkeep this observer for memory management
      registerObserver(this, 'binding', property, observer);
    },
    unbindProperty: function(name) {
      return unregisterObserver(name);
    },
    unbindAllProperties: function() {
      unregisterObserversOfType(this, 'property');
    }
  };

  // bind a property in A to a path in B by converting A[property] to a
  // getter/setter pair that accesses B[...path...]
  function bindProperties(inA, inProperty, inB, inPath) {
    log.bind && console.log("[%s]: bindProperties: [%s] to [%s].[%s]", inB.localName || 'object', inPath, inA.localName, inProperty);
    // capture A's value if B's value is null or undefined,
    // otherwise use B's value
    var v = PathObserver.getValueAtPath(inB, inPath);
    if (v === null || v === undefined) {
      PathObserver.setValueAtPath(inB, inPath, inA[inProperty]);
    }
    return PathObserver.defineProperty(inA, inProperty, 
        {object: inB, path: inPath});
  }

  // magic words

  var OBSERVE_SUFFIX = 'Changed';

  // bookkeeping observers for memory management

  var observers = new SideTable();
  
  function registerObserver(element, type, name, observer) {
    var o$ = getObserversOfType(element, type, true);
    o$[name.toLowerCase()] = observer;
  }
  
  function unregisterObserver(element, type, name) {
    var lcName = name.toLowerCase();
    var o$ = getObserversOfType(element, type);
    if (o$ && o$[lcName]) {
      o$[lcName].close();
      o$[lcName] = null;
      return true;
    }
  }
  
  function unregisterObserversOfType(element, type) {
    var $o = getObserversOfType(element, type);
    if ($o) {
      Object.keys($o).forEach(function(key) {
        unregisterObserver(element, type, key);
      });
    }
  }
  
  function getObserversOfType(element, type, force) {
    var b$ = observers.get(element);
    if (force) {
      if (!b$) {
        observers.set(element, b$ = {});
      }
      if (!b$[type]) {
        b$[type] = {};   
      }
    }
    return b$ && b$[type];
  }

  // exports

  //scope.bindProperties = bindProperties;
  //scope.registerObserver = registerObserver;
  //scope.unregisterObserver = unregisterObserver;
  //scope.unregisterObserversOfType = unregisterObserversOfType;

  scope.api.properties = properties;
  
})(Polymer);
