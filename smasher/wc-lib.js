var fs = require('fs');
var path = require('path');

// find all element tags in a file
var elementRx = /\<element[\s\S]*?\<\/element\>/gi;
// find all web component links <link rel="import" href="..">
var linkRx = /\<link rel=(["'])import\1\s+href=(["'])([^]*?)\2\/?\>/gi;
// extract the href attribute of a web component link
var hrefRx = /href=(["'])([^]*?)\1/i;

module.exports = {
  extractElements: function(inFileContent) {
    return inFileContent.match(elementRx) || [];
  },

  extractHRefSource: function(inRef) {
    if (hrefRx.test(inRef)) {
      return inRef.match(hrefRx)[2];
    }
  },

  resolveDependency: function(inName, inReference) {
    var dir = path.dirname(inName);
    var href = this.extractHRefSource(inReference);
    if (href) {
      return path.resolve(dir, href);
    }
  },

  extractLinks: function(inName, inContent) {
    var links = inContent.match(linkRx) || [];
    var outRefs = [];
    for (var i = 0, l, h; l = links[i]; i++) {
      if (h = this.resolveDependency(inName, l)) {
        outRefs.push(h);
      }
    }
    return outRefs;
  },

  stripLinks: function(inContent) {
    var r = new RegExp(linkRx.source + '\\n', 'gim');
    return inContent.replace(r, '');
  }
}
