/* 
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

//
// make inSource[inName] available on inTarget as a getter/setter
// pair or a method bound to this.node
//

function publishProperty(inSource, inName, inTarget) {
  // access property value (unless it is a getter itself)
  var value = (!inSource.__lookupGetter__(inName)) && inSource[inName];
  if (typeof value == 'function') {
    inTarget[inName] = function() {
      return value.apply(this.node, arguments);
    }
  } else {
    Object.defineProperty(inTarget, inName, {
      get: function() {
        return this.node[inName];
      },
      set: function(inValue) {
        this.node[inName] = inValue;
      }
    });
  }
};

// copy property 'name' from src to obj
var copyProperty = function(name, src, obj) {
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

// copy all properties from inProps (et al) to inObj
var mixin = function(inObj/*, inProps, inMoreProps, ...*/) {
  var obj = inObj || {};
  var p$ = Array.prototype.slice.call(arguments, 1);
  for (var i=0, p; (p=p$[i]); i++) {
    for (var n in p) {
      copyProperty(n, p, obj);
    }
  }
  return obj;
};

Fauxd = function(inNode) {
  this.node = inNode;
};

var base = {};
var archetype = document.createElement('div');
for (var n in archetype) {
  //console.log(n);
  publishProperty(archetype, n, base);
}

Fauxd.prototype = Object.create(base);
mixin(Fauxd.prototype, {
  fauxilate: function(inNodes) {
    var nodes = [], n;
    forEach(inNodes, function(np) {
      n = ShadowDOM.deref(np);
      n.tree = np;
      n = DOM(n);
      nodes.push(n);
    })
    return nodes;
  },
  realize: function(inNode) {
    return (inNode && inNode.node) || inNode;
  },
  get childNodes() {
    return this.fauxilate(this.node.childNodes);
  },
  get parentNode() {
    return DOM((this.node.changeling || this.node).parentNode);
  },
  removeChild: function(inChild) {
    var n = inChild.node;
    n = n.changeling || n;
    console.group('removeChild');
    console.log(this, this.node, inChild, n);
    console.groupEnd();
    this.node.removeChild(n);
    this.validateDistribution();
  },
  validateDistribution: function() {
    var n = this;
    while (n) {
      if (n.distribute) {
        n.distribute();
        return;
      }
      n = n.node.host || n.parentNode;
    }
  }
});

FauxLight = function(inNode) {
  Fauxd.call(this, inNode);
};
FauxLight.prototype = Object.create(Fauxd.prototype);
mixin(FauxLight.prototype, {
  distribute: function() {
    // make this a job
    this.node.distribute();
  },
  get childNodes() {
    return this.fauxilate(this.node.lightDOM.childNodes);
  },
  appendChild: function(inChild) {
    this.node.lightDOM.appendChild(this.realize(inChild));
    this.validateDistribution();
    return DOM(inChild);
  },
  get textContent() {
    // actual text content contains (this one includes Changelings)
    var tc = '';
    ShadowDOM.forEach(ShadowDOM.localNodes(this.node), function(n) {
      tc += n.textContent;
    });
    return tc;
  },
  set textContent(inValue) {
    this.node.lightDOM.textContent = inValue;
    this.validateDistribution();
  },
  get innerHTML() {
    var ih = '';
    ShadowDOM.forEach(ShadowDOM.localNodes(this.node), function(n) {
      ih += n.outerHTML;
    });
    return ih;
  },
  set innerHTML(inValue) {
    this.node.lightDOM.innerHTML = inValue;
    this.validateDistribution();
  }
});

FauxInsertionHost = function(inNode) {
  Fauxd.call(this, inNode);
};
FauxInsertionHost.prototype = Object.create(Fauxd.prototype);
mixin(FauxInsertionHost.prototype, {
  get childNodes() {
    return this.fauxilate(this.node.insertions);
  }
});

DOM = function(inNode) {
  if (!inNode) {
    return inNode;
  }
  if (!inNode.$fauxd) {
    var ctor = Fauxd;
    if (inNode.lightDOM) {
      ctor = FauxLight;
    } else if (inNode.insertions) {
      ctor = FauxInsertionHost;
    }
    inNode.$fauxd = new ctor(inNode);
  }
  return inNode.$fauxd; 
};

document.querySelector = function() {

};

// possible 'entry-points' to a subtree
/*
document.body // top of standard tree
window.<idOfNode> // magic globals
querySelector*
getElementBy*
childNodes
children
prevSibling
nextSibling
parentNode
*/