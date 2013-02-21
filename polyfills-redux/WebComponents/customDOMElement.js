/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function() {

var domCreateElement = document.createElement.bind(document);

// SECTION 4

function instantiate(inDefinition) {
  // 4.a.1. Create a new object that implements PROTOTYPE
  // 4.a.2. Let ELEMENT by this new object
  //
  // the custom element instantiation algorithm must also ensure that the
  // output is a valid DOM element with the proper wrapper in place.
  //
  var element = domCreateElement(inDefinition.tag);
  if (inDefinition.is) {
    element.setAttribute('is', inDefinition.is);
  }
  element = implement(element, inDefinition.prototype);
  var _elt = element;
  if (window.Nohd) {
    var _elt = SDOM(element);
    // attempt to publish our public interface directly
    // to our ShadowDOM polyfill wrapper object
    Object.keys(inDefinition.prototype).forEach(function(k) {
      //publishProperty(inDefinition.prototype, k, _elt);
      if (!(k in _elt)) {
        copyProperty(k, inDefinition.prototype, _elt);
      }
    });
  }
  if (inDefinition.lifecycle) {
    var created = inDefinition.lifecycle.created;
    if (created) {
      created.call(_elt);
    }
  }
  // OUTPUT
  return element;
}

function implement(inElement, inPrototype) {
  //var element = window.SDOM ? SDOM(inElement) : inElement;
  var element = inElement;
  if (Object.__proto__) {
    element.__proto__ = inPrototype;
  } else {
    // TODO(sjmiles):
    // probably can use something like this to truncate the 
    // prototype at the problem line for mixin
    // but it's complicated by SDOM
    /*
    var p = inPrototype;
    while (p && p.__proto__ !== inElement.__proto__) {
      p = p.__proto__;
    }
    if (window.SDOM) {
      p.__proto__ = element.__proto__;
    }
    */  
    mixin(element, inPrototype);
  }
  return element;
}

// FOO_CONSTRUCTOR = document.register(‘x-foo’, {
//   prototype: ELEMENT_PROTOTYPE,
//   lifecycle: {
//      created: CALLBACK
//   }
// });

function register(inName, inOptions) {
  //console.warn('document.register("' + inName + '", ', inOptions, ')');
  // construct a defintion out of options
  // TODO(sjmiles): probably should clone inOptions instead of mutating it
  var definition = inOptions || {};
  // must have a prototype, default to an extension of HTMLElement
  // TODO(sjmiles): probably should throw if no prototype, check spec
  definition.prototype = definition.prototype 
      || Object.create(HTMLUnknownElement.prototype);
  // extensions of native specializations of HTMLElement require localName
  // to remain native, and use secondary 'is' specifier for extension type
  // caller must specify a tag to declare a native localName
  definition.tag = definition.extends || inName;
  // if user declared a tag, use secondary 'is' specifier
  if (definition.extends) {
    definition.is = inName;
  }
  //definition.prototype.__definition__ = definition;
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
    return instantiate(inDefinition);
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
    // ad hoc solution is to simply stop at the first exception
    // see 'implement' above for possible better solution
    try {
      for (var n in p) {
        copyProperty(n, p, obj);
      }
    } catch(x) {
      //console.log(x);
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
window.mixin = mixin;

})();
