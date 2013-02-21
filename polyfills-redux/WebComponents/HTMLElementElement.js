/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

// TODO(sjmiles): implement HTMLElementElement via document.register

HTMLElementElement = function(inElement) {
  // options to glean from inElement attributes
  var options = {
    name: '',
    extends: null
  };
  // glean them
  takeAttributes(inElement, options);
  // default base
  var base = HTMLUnknownElement.prototype;
  // optional specified base
  if (options.extends) {
    // get the prototype of an instance of options.extends
    // TODO(sjmiles): to get the actual DOM prototype we
    // have to avoid any SDOM override, so here we use
    // the prototypical createElement
    base = Object.getPrototypeOf(
        Object.getPrototypeOf(document).createElement.call(
            document, options.extends));
  }
  // extend base
  options.prototype = Object.create(base);
  // support ShadowDOM shim
  var element = window.SDOM ? SDOM(inElement) : inElement;
  // install lifecycle function
  element.register = function(inMore) {
    if (inMore) {
      options.lifecycle = inMore.lifecycle;
      if (inMore.prototype) {
        mixin(options.prototype, inMore.prototype);
      }
    }
  };
  // locate user script
  var script = element.querySelector("script");
  if (script) {
    // execute user script in 'inElement' context
    executeComponentScript(script.textContent, element, options.name,
        inElement.ownerDocument._URL);
  };
  // register our new element
  document.register(options.name, options);
  return element;
};

// invoke inScript in inContext scope
function executeComponentScript(inScript, inContext, inName, inSourceUrl) {
  // set (highlander) context
  context = inContext;
  // compose script
  var code = "__componentScript('" 
    + inName 
    + "', function(){"
    + inScript 
    + "});"
    + "\n//@ sourceURL=" + inSourceUrl + "\n"
  ;
  eval(code);
}

var context;

// global necessary for script injection
window.__componentScript = function(inName, inFunc) {
  inFunc.call(context);
};

// utilities

// each property in inDictionary takes a value
// from the matching attribute in inElement, if any
function takeAttributes(inElement, inDictionary) {
  for (var n in inDictionary) {
    var a = inElement.attributes[n];
    if (a) {
      inDictionary[n] = a.value;
    }
  }
}