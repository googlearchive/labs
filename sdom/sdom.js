/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

//
// make inSource[inName] available on inTarget as a getter/setter
// pair or a method bound to this.node
//

var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);

function publishProperty(inSource, inName, inTarget) {
  // access property value (unless it is a getter itself)
  var value = (!inSource.__lookupGetter__(inName)) && inSource[inName];
  if (typeof value == 'function') {
    inTarget[inName] = function () {
      return value.apply(this.node, arguments);
    }
  } else {
    Object.defineProperty(inTarget, inName, {
      get:function () {
        return this.node[inName];
      },
      set:function (inValue) {
        this.node[inName] = inValue;
      }
    });
  }
};

// copy property 'name' from src to obj
function copyProperty(name, src, obj) {
  var g = src.__lookupGetter__(name);
  if (g) {
    obj.__defineGetter__(name, g);
  } else {
    obj[name] = src[name];
  }
  var s = src.__lookupSetter__(name);
  if (s) {
    obj.__defineSetter__(name, s);
  }
};

//copy all properties from inProps (et al) to inObj
function mixin(inObj/*, inProps, inMoreProps, ...*/) {
  var obj = inObj || {};
  var p$ = Array.prototype.slice.call(arguments, 1);
  for (var i = 0, p; (p = p$[i]); i++) {
    for (var n in p) {
      copyProperty(n, p, obj);
    }
  }
  return obj;
};

function Fauxd(inNode) {
  this.node = inNode;
};

var base = {};
var archetype = document.createElement('div');
for (var n in archetype) {
  publishProperty(archetype, n, base);
}

Fauxd.prototype = Object.create(base);
mixin(Fauxd.prototype, {
  fauxilate: function(inNodes) {
    var nodes = [];
    forEach(inNodes, function(n) {
      nodes.push(SDOM(n));
    });
    return nodes;
  },
  realize: function(inNode) {
    return (inNode && inNode.node) || inNode;
  },
  get childNodes() {
    return this.fauxilate(this.node.childNodes);
  },
  get children() {
    return this.fauxilate(this.node.children);
  },
  get parentNode() {
    return SDOM(this.node.parentNode);
  },
  get previousSibling() {
    return SDOM(this.node.previousSibling);
  },
  get previousElementSibling() {
    return SDOM(this.node.previousElementSibling);
  },
  get nextSibling() {
    return SDOM(this.node.nextSibling);
  },
  get nextElementSibling() {
    return SDOM(this.node.nextElementSibling);
  },
  get firstChild() {
    return SDOM(this.node.firstChild);
  },
  get lastChild() {
    return SDOM(this.node.lastChild);
  },
  get ownerDocument() {
    return this.node.ownerDocument;
  },
  querySelector: function(inSlctr) {
    return SDOM(this.node.querySelector(inSlctr));
  },
  querySelectorAll: function(inSlctr) {
    return this.fauxilate(this.node.querySelectorAll(inSlctr));
  },
  getElementsByClassName: function(inClassName) {
    return this.fauxilate(this.node.getElementsByClassName(inClassName));
  },
  getElementsByTagName: function(inTagName) {
    return this.fauxilate(this.node.getElementsByTagName(inTagName));
  },
  appendChild: function (inChild) {
    return SDOM(this.node.appendChild(this.realize(inChild)));
  },
  insertBefore: function (inChild, inBefore) {
    return SDOM(this.node.insertBefore(this.realize(inChild), this.realize(inBefore)));
  },
  removeChild: function (inChild) {
    var n = this.realize(inChild);
    return SDOM(this.node.removeChild(n));
  }
});

function SDOM(inNode) {
  if (!inNode) {
    return null;
  }
  if (inNode.$fauxd) {
    return inNode.$fauxd;
  }
  return inNode.$fauxd = new Fauxd(inNode);
};

(function () {
  dqs = document.querySelector.bind(document);
  dqsa = document.querySelectorAll.bind(document);
  dce = document.createElement.bind(document);
  dcdf = document.createDocumentFragment.bind(document);
  dgebid = document.getElementById.bind(document);
  dgebcn = document.getElementsByClassName.bind(document);
  dgebn = document.getElementsByName.bind(document);
  dgebtn = document.getElementsByTagName.bind(document);
  fauxilate = function(inNodes) {
    var nodes = [];
    forEach(inNodes, function(n) {
      nodes.push(SDOM(n));
    });
    return nodes;
  };
  document.querySelector = function(inSlctr) {
    return SDOM(dqs(inSlctr));
  };
  document.querySelectorAll = function(inSlctr) {
    return fauxilate(dqsa(inSlctr));
  };
  document.createElement = function(inTag) {
    return SDOM(dce(inTag));
  };
  document.createDocumentFragment = function() {
    return SDOM(dcdf());
  };
  document.getElementById = function(inId) {
    return SDOM(dgebid(inId));
  };
  document.getElementsByClassName = function(inClassName) {
    return fauxilate(dgebcn(inClassName));
  };
  document.getElementsByName = function(inName) {
    return fauxilate(dgebn(inName));
  };
  document.getElementsByTagName = function(inTagName) {
    return fauxilate(dgebtn(inTagName));
  };
})();

(function() {
  document.addEventListener('DOMContentLoaded', function() {
    db = document.body;
    // This fails on Safari.
    // TypeError: Attempting to change access mechanism for an unconfigurable property.
    Object.defineProperty(document, 'body', {
      get: function() {
        return SDOM(db);
      }
    });
  });
  dde = document.documentElement;
  Object.defineProperty(document, 'documentElement', {
    get: function() {
      return SDOM(dde);
    }
  });
})();


// possible 'entry-points' to a subtree
/*
 document.body // top of standard tree
 window.<idOfNode> // magic globals
 querySelector*
 getElementBy*
 childNodes
 children
 previousSibling
 nextSibling
 parentNode
 */
