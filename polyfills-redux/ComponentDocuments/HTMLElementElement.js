/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

// TODO(sjmiles): implement HTMLElementElement via document.register
HTMLElementElement = function(inElement) {
  var options = {
    name: ''
  };
  takeAttributes(inElement, options);
  var prototype = HTMLUnknownElement;
  document.register(options.name, {
    prototype: prototype
  });
};

// utilities

// for each property in inDictionary take a value
// from the matching attribute in inElement, if any
function takeAttributes(inElement, inDictionary) {
  for (var n in inDictionary) {
    var a = inElement.attributes[n];
    if (a) {
      inDictionary[n] = a.value;
    }
  }
}