/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function() {
  
function Nohd(inNode) {
  this.node = inNode;
};

var base = {};
var archetype = document.createElement('div');
for (var n in archetype) {
  publishProperty(archetype, n, base);
}

var fixconsole = function(n) {
  return n;
};

// IE only
if (!Object.__proto__) {
  fixconsole = function(n) {
    n.toString = fixconsole.arrayToString;
    return n;
  };
};

fixconsole.arrayToString = function() {
  var v = [];
  for (var i=0; i<this.length; i++) {
    v.push(this[i].nodeName);
  }
  return '[' + v.join(', ') + ']';
};

Nohd.prototype = Object.create(base);
mixin(Nohd.prototype, {
  isNohd: true,
  fauxilate: function(inNodes) {
    var nodes = [];
    forEach(inNodes, function(n) {
      nodes.push(SDOM(n));
    });
    // for IE only
    fixconsole(nodes);
    return nodes;
  },
  realize: function(inNode) {
    return (inNode && inNode.node) || inNode;
  },
  getChildNodes: function() {
    return this.fauxilate(this.node.childNodes);
  },
  get childNodes() {
    return this.getChildNodes();
  },
  get children() {
    return this.fauxilate(this.node.children || []);
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
    return SDOM(this.node.insertBefore(this.realize(inChild), 
        this.realize(inBefore)));
  },
  replaceChild: function(inNewchild, inOldChild) {
    return SDOM(this.node.replaceChild(this.realize(inNewchild), 
        this.realize(inOldChild)));
  },
  removeChild: function (inChild) {
    return SDOM(this.node.removeChild(this.realize(inChild)));
  },
  get textContent() {
    return this.node.textContent;
  },
  set textContent(inText) {
    this.node.textContent = '';
    if (inText) {
      this.appendChild(document.createTextNode(inText));
    }
  }
});

function _SDOM(inNode) {
  if (!inNode) {
    return null;
  }
  if (inNode instanceof Nohd) {
    return inNode;
  }
  if (inNode.$nohd) {
    return inNode.$nohd;
  }
  return inNode.$nohd = new Nohd(inNode);
};

fauxilate = Nohd.prototype.fauxilate;

dqs = document.querySelector.bind(document);
dqsa = document.querySelectorAll.bind(document);
dce = document.createElement.bind(document);
dcdf = document.createDocumentFragment.bind(document);
dctn = document.createTextNode.bind(document);
dgebid = document.getElementById.bind(document);
dgebcn = document.getElementsByClassName.bind(document);
dgebn = document.getElementsByName.bind(document);
dgebtn = document.getElementsByTagName.bind(document);
dde = document.documentElement;

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
document.createTextNode = function() {
  return SDOM(dctn.apply(document, arguments));
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

document.addEventListener('DOMContentLoaded', function() {
  db = document.body;
  // These fail on Safari.
  // TypeError: Attempting to change access mechanism
  // for an unconfigurable property.
  //  Object.defineProperty(document, 'body', {
  //    get: function() {
  //      return SDOM(db);
  //    }
  //  });
  //  Object.defineProperty(document, 'documentElement', {
  //    get: function() {
  //      return SDOM(dde);
  //    }
  //  });
});

/*
 
// TODO(sjmiles): this doesn't work, there's no way to override window.document

// wrap document

(function() {
  var base = {};
  var archetype = document;
  for (var n in archetype) {
    console.log(n);
    publishProperty(archetype, n, base);
  }
  var dahcument = Object.create(base);
  mixin(dahcument, {
    querySelector: function(inSlctr) {
      return SDOM(dqs(inSlctr));
    },
    querySelectorAll: function(inSlctr) {
      return fauxilate(dqsa(inSlctr));
    },
    createElement: function(inTag) {
      return SDOM(dce(inTag));
    },
    createDocumentFragment: function() {
      return SDOM(dcdf());
    },
    createTextNode: function() {
      return SDOM(dctn.apply(document, arguments));
    },
    getElementById: function(inId) {
      return SDOM(dgebid(inId));
    },
    getElementsByClassName: function(inClassName) {
      return fauxilate(dgebcn(inClassName));
    },
    getElementsByName: function(inName) {
      return fauxilate(dgebn(inName));
    },
    getElementsByTagName: function(inTagName) {
      return fauxilate(dgebtn(inTagName));
    }
  });
  window.document = dahcument;
})();
*/

// utilities

var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);

// make inSource[inName] available on inTarget as a getter/setter
// pair or a method bound to this.node
function publishProperty(inSource, inName, inTarget) {
  // access property value (unless it is a getter itself)
  var value = inSource[inName];
  if (typeof value === 'function') {
    inTarget[inName] = function () {
      return value.apply(this.node, arguments);
    };
  } else {
    Object.defineProperty(inTarget, inName, {
      get: function () {
        return this.node[inName];
      },
      set: function (inValue) {
        this.node[inName] = inValue;
      }
    });
  }
};

function mixin(inTarget, inSource) {
  var props = buildPropertyList(inSource);
  Object.defineProperties(inTarget, props);
};

function buildPropertyList(obj) {
  var props = {};
  for (var n in obj) {
    props[n] = Object.getOwnPropertyDescriptor(obj, n);
  }
  return props;
};

// exports

window.SDOM = _SDOM;
window.Nohd = Nohd;
window.mixin = mixin;
window.forEach = forEach;
window.fixconsole = fixconsole;
window.publishProperty = publishProperty;
window.$ = document.querySelector.bind(document);

})();
(function() {
  
ShadowDOMNohd = function(inNode) {
  Nohd.call(this, inNode);
};
ShadowDOMNohd.prototype = Object.create(Nohd.prototype);

// ShadowDOMNohd API

mixin(ShadowDOMNohd.prototype, {
  webkitCreateShadowRoot: function() {
    return new ShadowRoot(this);
  },
  // use ShadowDOM-aware query engine
  querySelector: function(inSlctr) {
    return localQuery(this, inSlctr);
  },
  querySelectorAll: function(inSlctr) {
    return localQueryAll(this, inSlctr);
  },
  // return the node array for the 'local tree'
  // JS cannot make NodeLists, so we always return
  // simple arrays (of Nohds)
  getChildNodes: function() {
    // if we own lightDOM, 'childNodes' always come from lightDOM
    if (this.lightDOM) {
      return this.lightDOM.childNodes;
    }
    // an insertion lists always represents 'childNodes' when present
    if (this.insertions) {
      return this.insertions;
    }
    // special roots specifically use alternate node array
    if (isLightRoot(this) || isShadowRoot(this)) {
      return this.nodes || [];
    }
    // otherwise, produce a Nohd array from the DOM childNodes
    return Nohd.prototype.getChildNodes.call(this);
  },
  // schedule this node for distribution
  invalidate: function() {
    //console.log("invalidating a distribution");
    addPendingDistribution(this);
    enjob(ShadowDOMNohd, 'validate', validateDistributions, 1);
  },
  appendChild: function(inChild) {
    if (isLightRoot(this)) {
      return appendChild(this, inChild);
    }
    if (isShadowRoot(this)) {
      this.host.invalidate();
      return appendChild(this, inChild);
    }
    // if has-a lightDOM
    if (this.lightDOM) {
      this.invalidate();
      inChild.lightDOMHost = this;
      return this.lightDOM.appendChild(inChild);
    }
    if (this.insertions) {
      this.insertions.push(inChild);
      return inChild;
    }
    return Nohd.prototype.appendChild.call(this, inChild);
  },
  appendComposedChild: function(inChild) {
    if (isShadowRoot(this) || isInsertionPoint(this)) {
      return appendChild(this, inChild);
    }
    return Nohd.prototype.appendChild.call(this, inChild);
  },
  getDistributedNodes: function() {
    return this.distributedNodes || [];
  },
  get webkitShadowRoot() {
    return this.shadow;
  },
  set webkitShadowRoot(inRoot) {
    this.shadow = inRoot;
  },
  get content() {
    if (!this.node.content && !this._content) {
      var frag = document.createDocumentFragment();
      forEach(this.childNodes, function(n) {
        frag.appendChild(n);
      });
      this._content = frag;
    }
    return SDOM(this.node.content) || this._content;
  },
  get composedNodes() {
    return this.nodes || this.fauxilate(this.node.childNodes);
  },
  clearComposedNodes: function() {
    if (this.nodes) {
      this.nodes = [];
    } else {
      this.textContent = '';
    }
  },
  setDistributedNodes: function(inDistributedNodes) {
    this.distributedNodes = inDistributedNodes;
    // When flattening we sometimes create an insertion list (if we
    // are an insertion host).
    // When the distributed nodes are reassigned, the insertion 
    // list is no longer valid.
    if (this.insertions) {
      this.insertions = null;
    }
  },
  clearChildNodes: function() {
    if (this.insertions) {
      this.insertions = null;
    }
    if (this.nodes) {
      this.nodes = [];
    }
    this.node.textContent = '';
  },
  project: function(inNodes) {
    this.clearChildNodes();
    forEach(inNodes, function(n) {
      this.node.appendChild(this.realize(n));
    }, this);
  }
});

// taxonomy

var isLightRoot = function(inNode) {
  return (inNode.localName == 'light-root');
};

var isShadowRoot = function(inNode) {
  return (inNode.localName == 'shadow-root');
};

// simulate DOM append on node-array inNodes

var appendChild = function(inParent, inChild) {
  var nodes = inParent.nodes = (inParent.nodes || []);
  if (inChild.nodeName === '#document-fragment') {
    forEach(inChild.childNodes, function(n) {
      nodes.push(n);
    }, this);
  } else {
    nodes.push(inChild);
  }
  return inChild;
};

// distribution cascade handling

var pendingDistributions = [];

var addPendingDistribution = function(inNode) {
  var i = pendingDistributions.indexOf(inNode);
  if (i >= 0) {
    pendingDistributions.splice(i, 1);
  }
  pendingDistributions.push(inNode);
};

var validateDistributions = function() {
  //console.group('validating distribution');
  while (pendingDistributions.length) {
    //console.log('executing cascaded distribution [' + 
    //  pendingDistributions[0].localName + ']');
    pendingDistributions.shift().distribute();       
  };
  //console.groupEnd();
};

// register named job on inObject
// will call inJob after inTimeout ms unless the job
// name is re-registered, resetting the timer
// iow, a job can be registered N times inside of inTimeout ms
// but it will only be performed once
var enjob = function(inObject, inName, inJob, inTimeout) {
  if (!inObject._jobs) {
    inObject._jobs = {};
  }
  var timeout = inTimeout || 100;
  if (inObject._jobs[inName]) {
    clearTimeout(inObject._jobs[inName]);
  }
  inObject._jobs[inName] = 
      setTimeout(function(){inJob.call(inObject);}, timeout);
};

//var $SDOM = SDOM;
SDOM = function(inNode) {
  if (!inNode) {
    return null;
  }
  if (inNode.isNohd) {
    return inNode;
  }
  if (inNode.$nohd) {
    return inNode.$nohd;
  }
  var ctor = ShadowDOMNohd;
  return inNode.$nohd = new ctor(inNode);
};

// exports

window.ShadowDOMNohd = ShadowDOMNohd;
window.SDOM = SDOM;

})();
/*
Copyright 2012 The Toolkitchen Authors. All rights reserved.
Use of this source code is governed by a BSD-style
license that can be found in the LICENSE file.
*/

// custom selectors:
//
// ~        = any node with lightDOM
// #<id>    = node with id = <id>
// *        = any non-Text node
// .<class> = any node with <class> in it's classList
// [<attr>] = any node with attribute <attr>
//
var generateMatcher = function(inSlctr) {
  if (!inSlctr) {
    return;
  }
  var c = inSlctr[0];
  if (inSlctr === "~") {
    return function(inNode) { 
      return Boolean(inNode.lightDOM);
    };
  }
  if (c === '#') {
    m = inSlctr.slice(1);
    return function(inNode) {
      return inNode.id === m;
    };
  }
  if (inSlctr === '*') {
    return function(inNode) {
      return inNode.nodeName !== '#text';
    };
  }
  if (c === '.') {
    m = inSlctr.slice(1);
    return function(inNode) {
      return inNode.classList && inNode.classList.contains(m);
    };
  }
  if (c === '[') {
    m = inSlctr.slice(1, -1);
    return function(inNode) {
      return inNode.hasAttribute && inNode.hasAttribute(m);
    };
  }
  var m = inSlctr.toUpperCase();
  return function(inNode) {
    return (inNode.tagName === m);
  };
};

// utility

var isInsertionPoint = function(inNode) {
  return {SHADOW:1, CONTENT:1}[inNode.tagName];
};

var search = function(inNodes, inMatcher) {
  var results = [];
  for (var i=0, n, np; (n=inNodes[i]); i++) {
    np = n.baby || n;
    // TODO(sjmiles): returning baby (np) is problematic as we lose tree 
    // context. So, we attach that context here. The context is only 
    // valid until the next _search_.
    np.tree = n;
    if (inMatcher(np)) {
      results.push(np);
    }
    if (!isInsertionPoint(np)) {
      results = results.concat(_search(np, inMatcher));
    }
  }
  return results;
};

var _search = function(inNode, inMatcher) {
  return search(inNode.childNodes, inMatcher);
//  return search((inNode.lightDOM && inNode.lightDOM.childNodes) ||
//    inNode.insertions || inNode.childNodes, inMatcher);
};

var localQueryAll = function(inNode, inSlctr) {
  var results = search(inNode.childNodes, generateMatcher(inSlctr));
  //var results = search(inNode.insertions || inNode.childNodes, generateMatcher(inSlctr));
  fixconsole(results);
  return results;
};

var localQuery = function(inNode, inSlctr) {
  return localQueryAll(inNode, inSlctr)[0];
};
/*
Copyright 2013 The Toolkitchen Authors. All rights reserved.
Use of this source code is governed by a BSD-style
license that can be found in the LICENSE file.
*/

(function() {

// stent IE console
if (!console.group) {
  console.group = console.log;
  console.groupEnd = console.log;
}

var ShadowRoot = function(inHost) {
  // ShadowDOM implies LightDOM
  if (!inHost.lightDOM) {
    // install lightDOM
    new LightDOM(inHost);
    // attach distribution method
    inHost.distribute = distribute;
  }
  // make a new root
  var root = document.createElement('shadow-root');
  // chain shadows
  root.olderSubtree = inHost.shadow;
  // mutual references
  root.host = inHost;
  inHost.webkitShadowRoot = root;
  // return the reference
  return root;
};

var LightDOM = function(inNode) {
  // make node for lightDOM
  var lightDOM = document.createElement('light-root');
  // back-reference host
  lightDOM.host = inNode;
  // move our children into the node
  moveChildren(inNode, lightDOM);
  // install lightDOM
  inNode.lightDOM = lightDOM;
  // return the node
  return lightDOM;
};

// utilities

var isInsertionPoint = function(inNode) {
  return {SHADOW:1, CONTENT:1}[inNode.tagName];
};

var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);

var moveChildren = function(inElement, inUpgrade) {
  var n$ = inElement.childNodes;
  inElement.clearChildNodes();
  forEach(n$, function(n) {
    // flag insertion points in inElement's immediate lightDOM to support 
    // distribution dependency resolution
    // see: distributeInsertions
    if (isInsertionPoint(n)) {
      n.lightDOMHost = inElement;
    }
    inUpgrade.appendChild(n);
  });
};

// distribution

var poolify = function(inNodes) {
  // construct a pool
  var pool = [];
  // our base set
  var base = inNodes;
  // for each node in our base set
  for (var i=0, n; (n=base[i]); i++) {
    // the contents of insertion points go into pool, not the points themselves
    if (isInsertionPoint(n)) {
      // recursively add contents of insertion point to pool
      pool = pool.concat(poolify(n.getDistributedNodes()));
    } else {
      // add this node directly to pool
      pool.push(n);
    }
  }
  // for IE console
  fixconsole(pool);
  return pool;
};

var distribute = function() {
  // primary shadow root
  var root = this.webkitShadowRoot;
  // content pool from lightDOM
  var pool = poolify(this.childNodes);
  // distribute any lightDOM to our shadowDOM(s)
  distributePool(pool, root);
  // virtualize insertion points
  flattenInsertionHosts(root);
  // project composed tree into the real DOM
  this.project(root.composedNodes);
};

var distributePool = function(inPool, inRoot) {
  // locate content nodes
  var insertions = localQueryAll(inRoot, 'content');
  // distribute pool to <content> nodes
  insertions.forEach(function(insertion) {
    distributeInsertions(inPool, insertion);
  });
  // distribute older shadow to <shadow>
  var shadow = localQuery(inRoot, 'shadow');
  if (shadow) {
    var olderRoot = inRoot.olderSubtree; 
    if (olderRoot) {
      // distribute pool into older <shadow>
      distributePool(inPool, olderRoot);
      // project subtree onto shadow
      shadow.setDistributedNodes(olderRoot.childNodes);
    }
  }
};

// extract a set of nodes from inPool matching inSlctr
var extract = function(inPool, inSlctr) {
  // generate a matcher function 
  var matcher = generateMatcher(inSlctr);
  // catch-all
  if (!matcher) {
    // remove all nodes form pool, and return the removed set
    return inPool.splice(0);
  } else {
    // move matching nodes from pool into result
    var result = [];
    for (var i=0, n; (n=inPool[i]); i++) {
      if (matcher(n)) {
        result.push(n);
        inPool.splice(i--, 1);
      }
    }
    // return the matched set
    return result;
  }
};

var distributeInsertions = function(inPool, inInsertionPoint) {
  var insertable = extract(inPool, inInsertionPoint.getAttribute('select'));
  // TODO(sjmiles): remember where/why we depend on this
  // create back-pointers from inserted nodes to the insertion point
  for (var i=0, n; (n=insertable[i]); i++) {
    if (n.host && n.host.tagName !== 'CONTENT') {
      console.warn('node already has host', n.host, inInsertionPoint, n);
    }
    n.host = inInsertionPoint;
  }
  // project nodes into insertion point
  inInsertionPoint.setDistributedNodes(insertable);
  // if the insertion point (inHost) is an IMMEDIATE child of
  // a lightDOM host, the lightDOM host needs redistribution
  // only immediate children are selectable (as content) so only immediate
  // children can affect the actual distribution of any lightDOM host
  if (inInsertionPoint.lightDOMHost) {
    inInsertionPoint.lightDOMHost.invalidate();
  }
};

var flattenInsertionHosts = function(inNode) {
  // first we determine the effective root for the composed tree:
  // 
  // if inNode is a regular node, the regular node is the root
  // if inNode is a shadow-host, it's the primary shadow-root
  //
  var root = inNode.webkitShadowRoot || inNode;
  //
  // next we locate the composed tree nodes
  // root's distributed nodes are not part of the canonical composed tree,
  // so we select them manually
  var nodes = root.distributedNodes || root.childNodes;
  if (nodes.length) {
    // if there is an insertion point in our nodes, then we are
    // an insertion host
    var isInsertionHost = false;
    // iterate over nodes
    for (var i=0, n; (n=nodes[i]); i++) {
      // flatten this subtree first
      flattenInsertionHosts(n);
      // if n is an 'insertion point', inNode is an 'insertion host'
      isInsertionHost = isInsertionHost || isInsertionPoint(n);
    }
    // if we are an insertion host...
    if (isInsertionHost) {
      // put our composed tree into 'insertions' and our flattened tree into 
      // 'childNodes'
      flattenInsertionHost(root);
    }
  }
};

var flattenInsertionHost = function(inNode) {
  // create insertion list if needed
  requireInsertionList(inNode);
  // notes
  // 
  // host will never have lightDOM (see root-finding above)
  // host can never be <content> or <shadow> as these do not exist
  //   in composed tree
  // insertion-lists do not express composed tree, and can be ignored
  // 
  // clear the composed tree (working nodes are captured in insertions)
  inNode.clearComposedNodes();
  // use insertion list to compile composed DOM
  for (var i=0, n; (n=inNode.insertions[i]); i++) {
    // if n is not flattenable
    if (!isInsertionPoint(n)) {
      // add n itself to the flattened-composed DOM
      inNode.appendComposedChild(n);
    } else {
      // add the pre-flattened nodes to the flattened composed DOM
      var nodes = n.nodes || n.getDistributedNodes();
      // add each node to the flattened-composed DOM
      for (var j=0, c; (c=nodes[j]); j++) {
        inNode.appendComposedChild(c);
      }
    }
  }
};

// ensure inNode has a populated insertion list
var requireInsertionList = function(inNode) {
  if (!inNode.insertions) {
    // distributedNodes must be managed specially
    var nodes = isInsertionPoint(inNode) ? inNode.getDistributedNodes() 
      : inNode.childNodes;
    inNode.insertions = nodes.slice(0);
  }
};

// exports

window.ShadowRoot = ShadowRoot;
window.ShadowDOM = {
  isInsertionPoint: isInsertionPoint
};

})();