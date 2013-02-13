ShadowDOMNohd = function(inNode) {
  Nohd.call(this, inNode);
};
ShadowDOMNohd.prototype = Object.create(Nohd.prototype);

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

mixin(ShadowDOMNohd.prototype, {
  validate: function() {
    enjob(this, 'validate', function() {
      console.log('executing jobbed distribution [' + this.localName + ']');
      this.distribute();
    }, 10);
  },
  appendChild: function(inChild) {
    if (this.localName == "shadow-root") {
      this.nodes = (this.nodes || []);
      if (inChild.nodeName == '#document-fragment') {
        forEach(inChild.childNodes, function(n) {
          this.nodes.push(n);
        }, this);
      } else {
        this.nodes.push(inChild);
      }
      if (this.host) {
        this.host.validate();
      }
      return inChild;
    }
    if (this.lightDOM) {
      this.validate();
      return this.lightDOM.appendChild(inChild);
    }
    if (this.insertions) {
      this.insertions.push(inChild);
      return inChild;
    }
    /*
    if (this.host && this.localName == 'shadow-root') {
      //console.log("validating shadow-root host");
      this.host.validate();
    }
    */
    return Nohd.prototype.appendChild.call(this, inChild);
  },
  getChildNodes: function() {
    if (this.localName == "shadow-root") {
      return this.nodes;
    }
    /*if (this.tagName == 'CONTENT') {
      return [];
    }*/
    if (this.lightDOM) {
      // this.lightDOM is a Nohd and will fauxilate
      return this.lightDOM.childNodes;
    }
    if (this.insertions) {
      return this.insertions;
    }
    return Nohd.prototype.getChildNodes.call(this);
  },
  getDistributedNodes: function() {
    return this.distributedNodes;
    //return Nohd.prototype.getChildNodes.call(this);
  },
  get webkitShadowRoot() {
    return this.shadow;
  },
  get content() {
    return SDOM(this.node.content) || this;
  },
  querySelector: function(inSlctr) {
    return localQuery(this, inSlctr);
  },
  querySelectorAll: function(inSlctr) {
    return localQueryAll(this, inSlctr);
  }
});

var $SDOM = SDOM;
SDOM = function(inNode) {
  if (!inNode) {
    return null;
  }
  if (inNode.$nohd) {
    return inNode.$nohd;
  }
  /*
  var ctor = Nohd;
  if (inNode.lightDOM) {
    ctor = ShadowDOMNohd;
  }
  */
  var ctor = ShadowDOMNohd;
  return inNode.$nohd = new ctor(inNode);
};