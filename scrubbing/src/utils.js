window.scrubbing = {};

(function(scope) {
  scope = scope || {};
  // TODO(sorvell): util-ify this.
  var mixinProps = function(inObject, inProps) {
    if (inProps) {
      Object.keys(inProps).forEach(function(key) {
        inObject[key] = inProps[key];
      });
    }
  }
  
  // TODO(sorvell): util-ify this.
  var invoke = function(inObject, inEventName /* args */) {
    var fn = inObject[inEventName];
    if (fn) {
      var args = Array.prototype.slice.call(arguments, 2);
      fn.apply(inObject.context || window, args);
    }
  }
  
  // exports
  scope.mixinProps = mixinProps;
  scope.invoke = invoke;
})(window.scrubbing);
