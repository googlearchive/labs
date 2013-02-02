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

// copy all properties from inProps (et al) to inObj
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
    //console.log(n);
    publishProperty(archetype, n, base);
}

Fauxd.prototype = Object.create(base);
mixin(Fauxd.prototype, {
    fauxilate:function (inNodes) {
        var nodes = [];
        forEach(inNodes, function (n) {
            nodes.push(SDOM(n));
        });
        return nodes;
    },
    realize:function (inNode) {
        return (inNode && inNode.node) || inNode;
    },
    get childNodes() {
        return this.fauxilate(this.node.childNodes);
    },
    get parentNode() {
        return SDOM((this.node.changeling || this.node).parentNode);
    },
    appendChild:function (inChild) {
        this.node.appendChild(this.realize(inChild));
    },
    insertBefore:function (inChild, inBefore) {
        this.node.insertBefore(this.realize(inChild), this.realize(inBefore));
    },
    removeChild:function (inChild) {
        var n = inChild.node;
        n = n.changeling || n;
        console.group('removeChild');
        console.log(this, this.node, inChild, n);
        console.groupEnd();
        this.node.removeChild(n);
        //this.validateDistribution();
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
    document.querySelector = function (inSlctr) {
        return SDOM(dqs(inSlctr));
    };
    document.querySelectorAll = function (inSlctr) {
        var nodes = [];
        forEach(dqsa(inSlctr), function (n) {
            nodes.push(SDOM(n));
        });
        return nodes;
    };
})();

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