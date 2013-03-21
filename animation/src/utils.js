(function() {
  var SIDE_EFFECT_SUFFIX = 'Changed', STORAGE_PREFIX = '__';

  function setupProperties(inProto) {
    for (var i in inProto) {
      if (inProto[i + SIDE_EFFECT_SUFFIX]) {
        setupProperty(inProto, i);
      }
    }
  }

  function setupProperty(inProto, inName) {
    var m = inName + SIDE_EFFECT_SUFFIX, s = STORAGE_PREFIX + inName;
    var defaultValue = inProto[inName], oldValue;
    Object.defineProperty(inProto, inName, {
      get: function() { return this[s] || defaultValue; },
      set: function(inValue) {
        if (inValue !== this[inName]) {
          oldValue = this[inName];
          this[s] = inValue;
          this[m](oldValue)
        }
      },
      enumerable: true,
      configurable: true
    });
  }
  
  function deserializeValue(inValue) {
    switch (inValue) {
      case '':
      case 'true':
        return true;
      case 'false':
        return false;
      case '\\false':
        return 'false';
      }
      return isNaN(inValue) ? inValue : parseFloat(inValue);
  }
  
  var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);
  
  // find the public property identified by inAttributeName
  function propertyForAttribute(inAttributeName) {
    for (var n in this) {
      if (n.toLowerCase() == inAttributeName) {
        return n;
      }
    }
  };
  
  function attributesToProperties(inNode) {
    //console.log('attributesToProperties', inNode);
    forEach(inNode.attributes, function(a) {
      // try to match this attribute to a property (attributess are
      // all lower-case, so this is case-insensitive search)
      var name = propertyForAttribute.call(inNode, a.name);
      if (name) {
        // deserialize Boolean or Number values from attribute
        var value = deserializeValue(a.value);
        //console.log(name, value);
        if (inNode[name] !== value) {
          inNode[name] = value;
        }
      }
    });
  };
  
  
  // designed to be called in some meaningful scope
  
  function getJobs() {
    return this.__jobs__ = this.__jobs__ || {};
  }
  
  var job = {
    job: function(inMethodName, inArgs, inTimeout) {
      this.cancelJob(inMethodName);
      var args = (inArgs && inArgs.length) ? inArgs : [inArgs];
      var jobId = window.setTimeout(this.completeJob.bind(this, inMethodName), inTimeout || 0);
      var jobs = getJobs.call(this);
      jobs[inMethodName] = {id: jobId, args: args};
      return jobId;
    },
    cancelJob: function(inMethodName) {
      var jobs = getJobs.call(this), job = jobs[inMethodName];
      if (job) {
        clearTimeout(job.id);
        jobs[inMethodName] = null;
      }
    },
    completeJob: function(inMethodName) {
      var jobs = getJobs.call(this, inMethodName), job = jobs[inMethodName];
      if (job) {
        this.cancelJob(inMethodName);
        if (this[inMethodName]) {
          this[inMethodName].apply(this, job.args);
        }
      }
    },
    completeJobs: function() {
      var jobs = getJob.call(this, inMethodName)
      for (var i in jobs) {
        this.completeJob(i);
      }
    },
    bindTo: function(inProto) {
      inProto.job = this.job;
      inProto.cancelJob = this.cancelJob;
      inProto.completeJob = this.completeJob;
      inProto.completeJobs = this.completeJobs;
    }
  }

  // exports
  document.utils = document.utils || {};
  document.utils.job = job;
  document.utils.setupProperties = setupProperties;
  document.utils.attributesToProperties = attributesToProperties;
})();