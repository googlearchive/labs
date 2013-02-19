/* 
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

var componentDocument = {
  selectors: [
    'link[rel=components]',
    'script[src]',
    'element'
  ],
  parseMap: {
    link: 'parseLink', 
    script: 'parseScript', 
    element: 'parseElement'
  },
  parse: function(inDocument) {
    console.log('parse:', inDocument.URL || inDocument._URL);
    var elts = inDocument.querySelectorAll(
        componentDocument.selectors.join(','));
    loader.preload(elts, function() {
      componentDocument.parseElts(inDocument, elts);
    });
  },
  parseElts: function(inDocument, inElts) {
    var map = componentDocument.parseMap;
    forEach(inElts, function(e) {
      componentDocument[map[e.localName]](e);
    });
  },
  parseLink: function(inLinkElt) {
    // in custom documents, href attribute is not parsed into a property
    console.log(inLinkElt.localName, inLinkElt.getAttribute('href'));
    loader.load(inLinkElt, function(err, response) {
      if (!err) {
        componentDocument.parse(
            makeDocument(response, inLinkElt.getAttribute('href')));
      }
    });
  },
  parseScript: function(inScriptElt) {
    // ignore scripts in primary document, they are already loaded
    if (inScriptElt.ownerDocument === document) {
      return;
    }
    // in custom documents, src attribute is not parsed into a property
    console.log(inScriptElt.localName, inScriptElt.getAttribute('src'));
    loader.load(inScriptElt, function(err, response) {
      if (!err) {
        console.log("script loaded");
      }
    });
 },
  parseElement: function(inElementElt) {
    console.log(inElementElt.localName, inElementElt.attributes.name.value);
  }
};

var makeDocument = function(inHTML, inUrl) {
  var doc = document.implementation.createHTMLDocument('component');
  doc.body.innerHTML = inHTML;
  doc._URL = inUrl;
  return doc;
};

loader = {
  load: function(inNode, inCallback) {
    var url = path.nodeUrl(inNode);
    console.log("load", inNode.localName, url);
    xhr.load(url, inCallback);  
  },
  preload: function(inElts, inCallback) {
    setTimeout(inCallback, 100);
  }
};

var path = {
  nodeUrl: function(inNode) {
    var nodeUrl = inNode.getAttribute("href") || inNode.getAttribute("src");
    return path.resolveNodeUrl(inNode, nodeUrl);
  },
  resolveNodeUrl: function(inNode, inRelativeUrl) {
    var baseUrl = this.documentUrlFromNode(inNode);
    return this.resolveUrl(baseUrl, inRelativeUrl);
  },
  documentUrlFromNode: function(inNode) {
    var d = inNode.ownerDocument;
    var url = (d && (d._URL || d.URL)) || "";
    // take only the left side if there is a #
    url = url.split("#")[0];
    return url;
  },
  resolveUrl: function(inBaseUrl, inUrl) {
    if (this.isAbsUrl(inUrl)) {
      return inUrl;
    }
    var base = this.urlToPath(inBaseUrl);
    return this.compressUrl(base + inUrl);
  },
  isAbsUrl: function(inUrl) {
    return /(^data:)|(^http[s]?:)|(^\/)/.test(inUrl);
  },
  urlToPath: function(inBaseUrl) {
    var parts = inBaseUrl.split("/");
    parts.pop();
    parts.push('');
    return parts.join("/");
  },
  compressUrl: function(inUrl) {
    var parts = inUrl.split("/");
    for (var i=0, p; i<parts.length; i++) {
      p = parts[i];
      if (p === "..") {
        parts.splice(i-1, 2);
        i -= 2;
      }
    }
    return parts.join("/");
  }
};

var xhr = {
  async: false,
  ok: function(inRequest) {
    return (inRequest.status >= 200 && inRequest.status < 300)
        || (inRequest.status === 304);
  },
  load: function(url, next, nextContext) {
    var request = new XMLHttpRequest();
    request.open('GET', url, xhr.async);
    request.addEventListener('readystatechange', function(e) {
      if (request.readyState === 4) {
        next.call(nextContext, !xhr.ok(request) && request,
          request.response);
      }
    });
    request.send();
  }
};

var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);
