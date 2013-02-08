/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

function extendsTag(inClass, inExtends) {
  var ctor = makePrototypeTwiddlingConstructorForDomNodes(inExtends, inClass);
  ctor.super = getClassForExtendee(inExtends);
  ctor.impl = inClass;
  return ctor;
}

function register(inName, inClass) {
  //console.log('registered [%s] extending [%s]', inName, tagFromChain(inClass.prototype));
  addToTagRegistry(inName, inClass, inClass.impl);
  return inClass;
}

document.register = register;

// actual implementation in our polyfill is better, this is enough for here
function makePrototypeTwiddlingConstructorForDomNodes(inExtends, inClass) {
  var props = buildPropertyList(inClass.prototype);
  return function() {
    var instance = document.createElement(inExtends);
    // for implementors of __proto__
    if (instance.__proto__) {
      var p = instance.__proto__;
      instance.__proto__ = inClass.prototype;
      inClass.prototype.__proto__ = p;
    } else {
      // for other
      Object.defineProperties(instance, props);
    }
    inClass.call(instance);
    return instance;
  }
}

function buildPropertyList(obj) {
  var props = {};
  for (var n in obj) {
    props[n] = Object.getOwnPropertyDescriptor(obj, n);
  }
  return props;
}

function addToTagRegistry(inName, inCtor, inClass) {
  registry[inName] = {ctor: inCtor, klass: inClass};
}

function getClassForExtendee(inExtends) {
  var record = window.registry && registry[inExtends];
  return record && record.klass || function() {};
}

// less-than-virtuous interventions in reality

registry = {};
var dce = document.createElement;
document.createElement = function(inTagName) {
  var record = registry[inTagName];
  return record ? new record.ctor() : dce.call(document, inTagName);
};

(function markPrototypes() {
  // Expand as needed.
  var tagNames = {
    "image": "img",
    "anchor": "a",
    "tablesection": "tbody", // could be <thead>, <tbody>, <tfood>.
    "tablerow": "tr",
    "tablecol": "col",
    "tablecell": "td", // could be <th> too.
    "tablecaption": "caption",
    "paragraph": "p",
    "directory": "dir",
    "mod": "ins" // could be <del> or <ins>.
  };
  for (var key in window) {
    var match = key.match(/HTML(.*?)Element/);
    var clazz = window[key];
    if (match && (typeof clazz == "function")) {
      var tagName = (match[1] || "div").toLowerCase();
      clazz.prototype.$tagName = tagNames[tagName] || tagName;
    }
  }
})();

function tagFromChain(inProtoChain) {
  var p = inProtoChain;
  while (p) {
    if (p.$tagName) {
      return p.$tagName;
    }
    p = Object.getPrototypeOf(p);
  }
}
