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

  // exports
  document.utils = document.utils || {};
  document.utils.setupProperties = setupProperties;
  document.utils.attributesToProperties = attributesToProperties;
})();