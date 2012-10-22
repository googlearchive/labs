(function(scope) {
  scope = scope || {};
  
  var lerp = {
    // linear interpolation
    interpolateValues: function(inA, inB, inT) {
      return (inB - inA) * inT + inA;
    },
    // lerp between two hashes
    interpolateObjects: function(inA, inB, inT) {
      var result = {};
      for (var n in inA) {
        result[n] = this.interpolateValues(inA[n], inB[n], inT);
      }
      return result;
    },
    // piecewise-lerp vectored hashes
    interpolateVector: function(inA, inT) {
      // integer part
      var ti = Math.floor(inT);
      // fraction
      var tf = inT - ti;
      // calculate vector members to interpolate between
      var s = ti % inA.length;
      s = s >= 0 ? s : inA.length + s;
      var e = (ti + 1) % inA.length;
      e = e >= 0 ? e : inA.length + e; 
      //console.log(s, e, tf);
      return this.interpolateObjects(inA[s], inA[e], tf);
    }
  }
  // exports
  scope.lerp = lerp;
})(window.scrubbing);
