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
  console.warn('document.register("' + inName + '", ' + inOptions + ')');
  // construct a defintion out of options
  // TODO(sjmiles): probably should clone inOptions instead of mutating it
  var definition = inOptions || {};
  // must have a prototype, default to an extension of HTMLElement
  definition.prototype = definition.prototype 
      || Object.create(HTMLElement.prototype);
  // extensions of native specializations of HTMLElement require localName
  // to remain native, and use secondary 'is' specifier for extension type
  // caller must specify a tag to declare a native localName
  definition.prototype.tag = definition.tag || inName;
  // if user declared a tag, use secondary 'is' specifier
  if (definition.tag) {
    definition.prototype.is = inName;
  }
  // 7.1.5: Register the DEFINITION with DOCUMENT
  registerDefinition(inName, definition);
  // 7.1.7. Run custom element constructor generation algorithm with PROTOTYPE
  // 7.1.8. Return the output of the previous step.
  definition.ctor = generateConstructor(definition);
  return definition.ctor;
}

var registry = {};

function registerDefinition(inName, inDefinition) {
  registry[inName] = inDefinition;
}

function generateConstructor(inDefinition) {
  return function() {
    return instantiate( inDefinition.prototype);
  };
}

function createElement(inTag) {
  var definition = registry[inTag];
  if (definition) {
    return new definition.ctor();
  }
  return domCreateElement(inTag);
}

// utilities

// copy all properties from inProps (et al) to inObj
function mixin(inObj/*, inProps, inMoreProps, ...*/) {
  var obj = inObj || {};
  for (var i = 1; i < arguments.length; i++) {
    var p = arguments[i];
    // TODO(sjmiles): on IE we are using mixin
    // to generate custom element instances, as we have
    // no way to alter element prototypes after creation
    // (nor a way to create an element with a custom prototype)
    // however, prototype sources (inSource) are ultimately
    // chained to a native prototype (HTMLElement or inheritor)
    // and trying to copy HTMLElement properties to itself throwss
    // in IE
    // we don't actually want to copy those properties anyway, but I
    // can't find a way to determine if a prototype is a native
    // or custom inheritor of HTMLElement
    // ad hoc solution is to simply stop if there is an exception
    try {
      for (var n in p) {
        copyProperty(n, p, obj);
      }
    } catch(x) {
      console.log(x);
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

// exports

document.register = register;
document.createElement = createElement;