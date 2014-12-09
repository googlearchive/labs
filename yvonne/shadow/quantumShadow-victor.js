/**
 * Calculate shadow approximation for 2d systems using two drop shadow effects
 * @param {array} objPos Two element array containing X and Y positions for the shadow casting object
 * @param {array} lightPos Two element array containing X and Y positions for the key light
 * @param {number} zHeight Number indicating Z height of shadow casting objects, supplied in DPs
 * @param {object} options Object containing optional parameters to override defaults, including:
 *     densityMult: adjusts scaling of result to screen density since internal calcualtions are in DPs
 *     keyLightAngle: andle of incidence for key light
 *     keyLightHeight: height of light in DPs
 *     keyLightDiameter: diameter of light in DPs
 *     keyShadowOpacity: default key shadow opacity
 *     ambientShadowOpacity: default fill shadow opacity
 * @return {object} object containing calcualted values for key and ambient shadows
 */
quantumShadow = function(objPos, lightPos, zHeight, options) {
  //  Check for required parameters
  if ((objPos === undefined) || (lightPos === undefined) || (zHeight === undefined)) {
    return undefined;
  }

  //  Load options
  (options === undefined) ? options = {}: options = options;
  var densityMult = (options.hasOwnProperty('densityMult')) ? options.densityMult : 1; // scaling for DPs to PX, default of 1 means 1dp = 1px
  var keyLightAngle = (options.hasOwnProperty('keyLightAngle')) ? options.keyLightAngle : 45; // key light angle in degrees
  var keyLightHeight = (options.hasOwnProperty('keyLightHeight')) ? options.keyLightHeight : 800; // light height in density-indepenedent pixels
  var keyLightDiameter = (options.hasOwnProperty('keyLightDiameter')) ? options.keyLightDiameter : 800; // light diameter in density-indepenedent pixels
  var keyShadowOpacity = (options.hasOwnProperty('keyShadowOpacity')) ? options.keyShadowOpacity : .24; // default key shadow opacity
  var ambientShadowOpacity = (options.hasOwnProperty('ambientShadowOpacity')) ? options.ambientShadowOpacity : .12; // default fill shadow opacity

  //  Required vector functions
  /**
   * Normalize a vector (take a vector and make it length of 1 unit)
   * @param {array} v The vector to be normalized. Should be 2 or 3 element array.
   * @return {array} Two or three element array representing the normalized vector
   */
  vectorNormalize = function(v) {
    var result = null
    var numElements = v.length;

    if (numElements != undefined) {
      var vLength = vectorLength(v)
      if (vLength > 0) {
        result = v / vLength;
      } else {
        result = [];
        for ( var i = 0; i < numElements; i++ ) {
          result.push(0);
        }
      }
    }

    return result;
  }

  /**
   * Convert value in radians to degrees
   * @param {number} rad Input value in radians to convert to degrees
   * @return {number} Output value in degrees
   */
  radiansToDegrees = function(rad) {
    return rad * (180 / Math.PI);
  }

  /**
   * Convert value in degrees to radians
   * @param {number} deg Input value in degrees to convert to radians
   * @return {number} Output value in radians
   */
  degreesToRadians = function(deg) {
    return deg / (180 / Math.PI)
  }

  // calculate light direction
  var shadowVector = vectorNormalize(objPos - lightPos);
  var keyShadowDirection = radiansToDegrees(Math.atan2(shadowVector[1], shadowVector[0])) + 90; // we add 90 degrees since atan2 is ccw angle from +x axis
  var ambientShadowDirection = keyShadowDirection;

  // calculate shadow distance
  var keyShadowOffset = Math.tan(degreesToRadians(keyLightAngle)) * zHeight * densityMult;
  var ambientShadowOffset = 0;

  // calculate normalized height of object to light height
  var normalizedHeight = zHeight / keyLightHeight;

  // key shadow softness
  var keyShadowSoftness = 0;
  if (normalizedHeight > 0) {
    keyShadowSoftness = (normalizedHeight / (1 - normalizedHeight) * keyLightDiameter) * 2 * densityMult;
  }

  // ambient shadow softness
  var ambientShadowSoftness = zHeight * 2 * densityMult;

  return {
    keyShadow: {
      opacity: keyShadowOpacity,
      offset: keyShadowOffset,
      direction: keyShadowDirection,
      softness: keyShadowSoftness
    },
    ambientShadow: {
      opacity: ambientShadowOpacity,
      offset: ambientShadowOffset,
      direction: ambientShadowDirection,
      softness: ambientShadowSoftness
    }
  }
}

/**
 * Calculate shadow approximation for 2d systems using two drop shadow effects
 * @param {array} objPos Two element array containing X and Y positions for the shadow casting object
 * @param {array} lightPos Two element array containing X and Y positions for the key light
 * @param {number} zHeight Number indicating Z height of shadow casting objects, supplied in DPs
 * @param {object} options Object containing optional parameters to override defaults, including:
 *     densityMult: adjusts scaling of result to screen density since internal calcualtions are in DPs
 *     keyLightAngle: andle of incidence for key light
 *     keyLightHeight: height of light in DPs
 *     keyLightDiameter: diameter of light in DPs
 *     keyShadowOpacity: default key shadow opacity
 *     ambientShadowOpacity: default fill shadow opacity
 * @return {string} CSS formatted box-shadow string containing calcualted values for key and ambient shadows
 */
quantumShadowCSS = function(objPos, lightPos, zHeight, options) {
  //  Check for required parameters
  if ((objPos === undefined) || (lightPos === undefined) || (zHeight === undefined)) {
    return undefined;
  }

  //  Load options
  (options === undefined) ? options = {}: options = options;
  var densityMult = (options.hasOwnProperty('densityMult')) ? options.densityMult : 1; // scaling for DPs to PX, default of 1 means 1dp = 1px
  var keyLightAngle = (options.hasOwnProperty('keyLightAngle')) ? options.keyLightAngle : 45; // key light angle in degrees
  // var keyLightHeight = (options.hasOwnProperty('keyLightHeight')) ? options.keyLightHeight : 800; // light height in density-indepenedent pixels
  var keyLightHeight = (options.hasOwnProperty('keyLightHeight')) ? options.keyLightHeight : 600; // light height in density-indepenedent pixels
  var keyLightDiameter = (options.hasOwnProperty('keyLightDiameter')) ? options.keyLightDiameter : 800; // light diameter in density-indepenedent pixels
  var keyShadowOpacity = (options.hasOwnProperty('keyShadowOpacity')) ? options.keyShadowOpacity : .24; // default key shadow opacity
  var ambientShadowOpacity = (options.hasOwnProperty('ambientShadowOpacity')) ? options.ambientShadowOpacity : .12; // default fill shadow opacity

  //  Required vector functions
  /**
   * Normalize a vector (take a vector and make it length of 1 unit)
   * @param {array} v The vector to be normalized. Should be 2 or 3 element array.
   * @return {array} Two or three element array representing the normalized vector
   */
  // vectorNormalize = function(v) {
  //   var result = null
  //   var numElements = v.length;

  //   if (numElements != undefined) {
  //     var vLength = vectorLength(v)
  //     if (vLength > 0) {
  //       result = v / vLength;
  //     } else {
  //       result = [];
  //       for ( var i = 0; i < numElements; i++ ) {
  //         result.push(0);
  //       }
  //     }
  //   }

  //   return result;
  // }

  /**
   * Convert value in radians to degrees
   * @param {number} rad Input value in radians to convert to degrees
   * @return {number} Output value in degrees
   */
  radiansToDegrees = function(rad) {
    return rad * (180 / Math.PI);
  }

  /**
   * Convert value in degrees to radians
   * @param {number} deg Input value in degrees to convert to radians
   * @return {number} Output value in radians
   */
  degreesToRadians = function(deg) {
    return deg / (180 / Math.PI)
  }

  // calculate shadow distance
  var keyShadowOffset = Math.tan(degreesToRadians(keyLightAngle)) * zHeight * densityMult;
  var ambientShadowOffset = 0;

  objPos = Victor.fromArray(objPos);
  lightPos = Victor.fromArray(lightPos);

  // calculate light direction
  var shadowVector = objPos.clone().subtract(lightPos).normalize();
  //var keyShadowDirection = radiansToDegrees(Math.atan2(shadowVector[1], shadowVector[0])) + 90; // we add 90 degrees since atan2 is ccw angle from +x axis
  //var ambientShadowDirection = keyShadowDirection;


  var keyShadowPos = shadowVector.clone().multiply(new Victor(keyShadowOffset, keyShadowOffset));
  var ambientShadowPos = shadowVector.clone().multiply(new Victor(ambientShadowOffset, ambientShadowOffset));


  // calculate normalized height of object to light height
  var normalizedHeight = zHeight / keyLightHeight;

  // key shadow softness
  var keyShadowSoftness = 0;
  if (normalizedHeight > 0) {
    keyShadowSoftness = (normalizedHeight / (1 - normalizedHeight) * keyLightDiameter) * 2 * densityMult;
  }

  var keyShadowColor = [0, 0, 0, keyShadowOpacity];
  var ambientShadowColor = [0, 0, 0, ambientShadowOpacity];

  // ambient shadow softness
  var ambientShadowSoftness = zHeight * 2 * densityMult;

  keyShadowPos = keyShadowPos.toArray();
  ambientShadowPos = ambientShadowPos.toArray();

  console.log('key', keyShadowOpacity, keyShadowPos);
  console.log('ambient', ambientShadowOpacity, ambientShadowPos);

  // var boxShadowString = 'box-shadow:';
  var boxShadowString = '';
  boxShadowString += 'rgba(0, 0, 0, ' + keyShadowOpacity.toFixed(2) + ') ' + keyShadowPos[0].toString() + 'px ' + keyShadowPos[1].toString() + 'px ' + keyShadowSoftness.toString() + 'px 0px';
  boxShadowString += ', rgba(0, 0, 0, ' + ambientShadowOpacity.toFixed(2) + ') ' + ambientShadowPos[0].toString() + 'px ' + ambientShadowPos[1].toString() + 'px ' + ambientShadowSoftness.toString() + 'px 0px';

  return boxShadowString;
}
