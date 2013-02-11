/*
Copyright 2012 The Toolkitchen Authors. All rights reserved.
Use of this source code is governed by a BSD-style
license that can be found in the LICENSE file.
*/
;(function() {

var ShadowRoot = function(inNode) {
  // ShadowDOM implies LightDOM
  if (!inNode.lightDOM) {
    new LightDOM(inNode);
  }
  // make a new root
  var root = document.createElement("shadow-root");
  // chain shadows
  root.olderSubtree = inNode.shadow;
  // mutual references
  root.host = inNode;
  // TODO(sjmiles): cannot set this on proper nodes if native ShadowDOM 
  // is supported
  inNode.webkitShadowRoot = root;
  // TODO(sjmiles): would be deprecated, but is necessary because of above
  inNode.shadow = root;
  // get shadows store
  // TODO(sjmiles): non-spec
  var shadows = inNode.shadows;
  // if there is no store
  if (!shadows) {
    // create shadow store
    shadows = inNode.shadows = document.createDocumentFragment();
    // add API to inNode
    inNode.distribute = distribute;
  }
  // install the root
  shadows.appendChild(root);
  // return the reference
  return root;
};

var LightDOM = function(inNode) {
  // store lightDOM as a document fragment
  var lightDOM = document.createDocumentFragment();
  // back-reference host
  lightDOM.host = inNode;
  // identify this fragment as lightDOM
  lightDOM.isLightDOM = true;
  // move our children into the fragment
  moveChildren(inNode, lightDOM);
  // return the fragment
  return inNode.lightDOM = lightDOM;
};

var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);

var moveChildren = function(inElement, inUpgrade) {
  var n$ = inElement.insertions;
  if (n$) {
    // clean up insertions and content rendered from insertions
    inElement.insertions = null;
    inElement.textContent = '';
  } else {
    n$ = [];
    forEach(inElement.childNodes, function(n) {
      n$.push(n);
    });
  }
  forEach(n$, function(n) {
    inUpgrade.appendChild(n);
  });
};

// utility

var isInsertionPoint = function(inNode) {
  return {SHADOW:1, CONTENT:1}[inNode.tagName];
};

// distribution

var poolify = function(inNodes) {
  // construct a pool
  var pool = [];
  // massage input: NodeList or null -> Array
  //var base = inNodes ? Array.prototype.slice.call(inNodes, 0) : [];
  var base = inNodes;
  for (var i=0, n; (n=base[i]); i++) {
    // only the content of insertion points go into pool
    if (isInsertionPoint(n)) {
      // remove insertion point itself from seletable nodes
      base.splice(i--, 1);
      // recursively add contents of insertion point to pool
      //pool = pool.concat(poolify(n.insertions || n.childNodes));
      pool = pool.concat(poolify(n.childNodes));
    } else {
      // add this node directly to pool
      pool.push(n);
    }
  }
  fixconsole(pool);
  return pool;
};

var distribute = function() {
  // primary shadow root
  var root = this.shadows.lastChild;
  // content pool from lightDOM
  // under SDOM:
  //  childNodes is always lightDOM.childNodes (which is fauxilated)
  //console.log("distribute: childNodes: ", this.childNodes);
  var pool = poolify(this.childNodes);
  //console.log("distribute: pool: ", pool);
  // distribute any lightDOM to our shadowDOM(s)
  distributePool(pool, root);
  // virtualize insertion points
  //flatten(root);
  // project composed tree
  fauxProject(root.childNodes, this.node);
  //new Projection(this).addNodes(root.composedNodes || root.childNodes);
};

var distributePool = function(inPool, inRoot) {
  // locate content nodes
  var insertions = localQueryAll(inRoot, "content");
  //console.log('insertions: ', insertions);
  // distribute pool to <content> nodes
  insertions.forEach(function(insertion) {
    distributeInsertions(inPool, insertion);
  });
  // distribute older shadow to <shadow>
  var shadow = localQuery(inRoot, "shadow");
  //console.log('shadow: ', shadow);
  if (shadow) {
    var olderRoot = inRoot.previousSibling;
    if (olderRoot) {
      // project the EXPLODED root-tree into <shadow>
      //new Projection(shadow).addNodes(olderRoot.insertions
      //  || olderRoot.childNodes);
      distributePool(inPool, olderRoot);
      fauxProject(olderRoot.childNodes, shadow);
    }
  }
  //
  // distribute any contained objects
//  var comps = localQueryAll(inRoot, "~");
//  comps.forEach(function(c) {
//    c.distribute();
//  });
};

var extract = function(inPool, inSlctr) {
  var matcher = generateMatcher(inSlctr);
  if (!matcher) {
    return inPool.splice(0);
  } else {
    var result = [];
    for (var i=0, n; (n=inPool[i]); i++) {
      if (matcher(n)) {
        result.push(n);
        inPool.splice(i--, 1);
      }
    }
    return result;
  }
};

var distributeInsertions = function(inPool, inInsertionPoint) {
  var slctr = inInsertionPoint.getAttribute("select");
  var insertable = extract(inPool, slctr);
  hostInsertions(insertable, inInsertionPoint);
};

var hostInsertions = function(inNodes, inHost) {
  // create back-pointers from inserted nodes to the insertion point
  for (var i=0, n; (n=inNodes[i]); i++) {
    if (n.host && n.host.tagName !== 'CONTENT') {
      console.warn('node already has host', n.host, inHost, n);
    }
    n.host = inHost;
  }
  // project nodes into insertion point
  //new Projection(inHost).addNodes(inNodes);
  fauxProject(inNodes, inHost);
};

var fauxProject = function(inNodes, inHost) {
  //console.log('projecting into host: ', inHost.localName);
  inHost.textContent = '';
  forEach(inNodes, function(n) {
    n = n.cloneNode(true);
    inHost.appendChild(n);
    //console.log('   ' + n.localName);
  });
};

// exports

window.ShadowRoot = ShadowRoot;

})();