/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

// SECTION 4

var domCreateElement = document.createElement.bind(document);

function instantiate(inPrototype) {
  // 4.a.1. Create a new object that implements PROTOTYPE
  // 4.a.2. Let ELEMENT by this new object
  //
  // the custom element instantiation algorithm must also ensure that the
  // output is a valid DOM element with the proper wrapper in place.
  //
  var element = domCreateElement(inPrototype.tag);
  if (inPrototype.is) {
    element.setAttribute('is', inPrototype.is);
  }
  implement(element, inPrototype);
  //
  // OUTPUT
  return element;
}

function implement(inElement, inPrototype) {
  if (Object.__proto__) {
    inElement.__proto__ = inPrototype;
  } else {
    mixin(inElement, inPrototype);
  }
}

// FOO_CONSTRUCTOR = document.register(‘x-foo’, {
//   prototype: ELEMENT_PROTOTYPE,
//   lifecycle: {
//      created: CALLBACK
//   }
// });

function register(inName, inOptions) {
  // construct a defintion out of options
  // TODO(sjmiles): probably should clone inOptions instead of mutating it
  var definition = inOptions || {};
  definition.prototype = definition.prototype || HTMLUnknownElement.prototype;
  definition.prototype.tag = definition.tag || inName;
  if (definition.tag) {
    definition.prototype.is = inName;
  }
  // 7.1.5: Register the DEFINITION with DOCUMENT
  registerDefinition(inName, definition);
  // 7.1.7. Run custom element constructor generation algorithm with PROTOTYPE
  // 7.1.8. Return the output of the previous step.
  var ctor = generateConstructor(definition);
  return ctor;
}

var registry = {};

function registerDefinition(inName, inDefinition) {
  registry[inName] = inDefinition;
}

function generateConstructor(inDefinition) {
  var prototype = inDefinition.prototype || HTMLUnknownElement.prototype;
  return function() {
    return instantiate(prototype);
  };
}

// utilities

// copy all properties from inProps (et al) to inObj
function mixin(inObj/*, inProps, inMoreProps, ...*/) {
  var obj = inObj || {};
  for (var i = 1; i < arguments.length; i++) {
    var p = arguments[i];
    for (var n in p) {
      copyProperty(n, p, obj);
    }
  }
  return obj;
}

// copy property inName from inSource object to inTarget object
function copyProperty(inName, inSource, inTarget) {
  Object.defineProperty(inTarget, inName,
      getPropertyDescriptor(inSource, inName));
}

// get property descriptor for inName on inObject, even if
// inName exists on some link in inObject's prototype chain
function getPropertyDescriptor(inObject, inName) {
  if (inObject) {
    var pd = Object.getOwnPropertyDescriptor(inObject, inName);
    return pd || getPropertyDescriptor(Object.getPrototypeOf(inObject));
  }
}
