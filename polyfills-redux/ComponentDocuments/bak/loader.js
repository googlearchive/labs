/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {

// NOTE: uses 'window' and 'document' globals

scope = scope || (window.webComponents = {});
scope.flags = scope.flags || {};

// imports

var log = scope.flags.logloader || true;

// TODO(sjmiles): these implementations are ad-hoc, and have minimal error
// checking
// 
// There is no spec yet, but there is this:
// http://lists.w3.org/Archives/Public/public-webapps/2012JulSep/0587.html

// web component resource loader

var componentLinkSlctr = 'link[rel=components]';
var componentResourceSlctr = 'element link[rel=stylesheet],element script[src]';

var componentLoader = {
  forEachLinkedDocument: function(inDocument, inCb) {
    loader.oncomplete = function() {
      forEach(loader.docs, inCb);
    };
    componentLoader._preload(inDocument);
  },
  preload: function(inDocument, inNext) {
    loader.oncomplete = inNext;
    componentLoader._preload(inDocument);
  },
  _preload: function(inNode) {
    var links = inNode.querySelectorAll(componentLinkSlctr);
    forEach(links, function(n) {
      loader.loadDocument(n, function(err, response) {
        if (!err) {
          componentLoader._preload(response);
        }
      });
    });
    var resources = inNode.querySelectorAll(componentResourceSlctr);
    forEach(resources, function(n) {
      loader.load(n, nop);
    });
    loader.checkComplete();
  },
  fetch: function(inNode) {
    return loader.fetchFromCache(inNode);
  },
  get documents() {
    return loader.docs;
  }
};

// caching parallel loader

// load N resources asynchronously and in parallel with completion tracking and
// deduping
// 
// resources are not parsed or evaluated (except for HTMLDocuments), but are
// merely placed in a cache for in-order traversal later
// 
// HTMLDocuments are constructed so they can be traversed themselves
// 
// uses Node.js-style asynchrony convention, so callbacks take two parameters:
// err, response

var loader = {
  load: function(inNode, inNext) {
    this.push();
    this.loadFromNode(inNode, function(err, response) {
      inNext(err, response);
      this.pop();
    }.bind(this));
  },
  loadDocument: function(inNode, inNext) {
    this.push();
    this.loadFromNode(inNode, function(err, response, url) {
      inNext(err, this.docs[url] = (this.docs[url]
         || makeDocument(response, url)));
      this.pop();
    }.bind(this));
  },
  // HTMLDocument cache
  docs: {},
  // other caching
  cache: {},
  pending: {},
  display: function(inUrl) {
    return "..." + inUrl.split("/").slice(-2).join("/");
  },
  nodeUrl: function(inNode) {
    return path.nodeUrl(inNode);
  },
  loadFromNode: function(inNode, inNext) {
    var url = loader.nodeUrl(inNode);
    if (!this.cached(url, inNext)) {
      this.request(url, inNext);
    }
  },
  cached: function(inUrl, inNext) {
    var data = this.cache[inUrl];
    if (data === undefined) {
      return false;
    }
    if (data === this.pending) {
      var p = data[inUrl] = data[inUrl] || [];
      p.push(inNext);
    } else {
      log && console.log(loader.display(inUrl), "cached or pending");
      inNext(null, this.cache[inUrl], inUrl);
    }
    return true;
  },
  request: function(inUrl, inNext) {
    this.cache[inUrl] = this.pending;
    var onload = function(err, response) {
      log && console.log("(" + inUrl, "loaded)");
      this.cache[inUrl] = response;
      inNext(err, response, inUrl);
      this.resolvePending(inUrl);
    };
    xhr.load(inUrl, onload.bind(this));
  },
  resolvePending: function(inUrl) {
    var p = this.pending[inUrl];
    if (p) {
      p.forEach(function(next) {
        log && console.log(loader.display(inUrl), "resolved via cache");
        next(null, null, inUrl);
      });
      this.pending[inUrl] = null;
    }
  },
  // completion tracking
  oncomplete: nop,
  inflight: 0,
  push: function() {
    this.inflight++;
  },
  pop: function() {
    this.inflight--;
    this.checkComplete();
  },
  checkComplete: function() {
    if (this.inflight === 0) {
      this.oncomplete();
    }
  },
  fetchFromCache: function(inNode) {
    var url = loader.nodeUrl(inNode);
    var data = this.docs[url] || this.cache[url];
    if (data === undefined) {
      log && console.error(url + " was not in cache");
    }
    return data;
  }
};

// utilities

var nop = function() {};

var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);

var xhr = {
  ok: function(inRequest) {
    return (inRequest.status >= 200 && inRequest.status < 300)
        || (inRequest.status === 304);
  },
  load: function(url, next, context) {
    var request = new XMLHttpRequest();
    request.open('GET', url);
    request.addEventListener('readystatechange', function(e) {
      if (request.readyState === 4) {
        next.call(context, !xhr.ok(request) && request,
          request.response);
      }
    });
    request.send();
  }
};

var makeDocument = function(inHTML, inName) {
  var doc = document.implementation.createHTMLDocument('component');
  doc.body.innerHTML = inHTML;
  doc.name = inName;
  return doc;
};

var path = {
  nodeUrl: function(inNode) {
    var nodeUrl = inNode.getAttribute("href") || inNode.getAttribute("src");
    var url = path.resolveNodeUrl(inNode, nodeUrl);
    return url;
  },
  resolveNodeUrl: function(inNode, inRelativeUrl) {
    var baseUrl = this.documentUrlFromNode(inNode);
    return this.resolveUrl(baseUrl, inRelativeUrl);
  },
  documentUrlFromNode: function(inNode) {
    var n = inNode, p;
    while ((p = n.parentNode)) {
      n = p;
    }
    var url = (n && (n.name || n.URL)) || "";
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
  urlToPath: function(inBaseUrl) {
    var parts = inBaseUrl.split("/");
    parts.pop();
    return parts.join("/") + "/";
  },
  isAbsUrl: function(inUrl) {
    return /(^data:)|(^http[s]?:)|(^\/)/.test(inUrl);
  },
  // make a relative path from source to target
  makeRelPath: function(inSource, inTarget) {
    var s, t;
    s = this.compressUrl(inSource).split("/");
    t = this.compressUrl(inTarget).split("/");
    while (s.length && s[0] === t[0]){
      s.shift();
      t.shift();
    }
    for(var i = 0, l = s.length-1; i < l; i++) {
      t.unshift("..");
    }
    return t.join("/");
  },
  compressUrl: function(inUrl) {
    var parts = inUrl.split("/");
    for (var i=0, p; i < parts.length; i++) {
      p = parts[i];
      if (p === "..") {
        parts.splice(i-1, 2);
        i -= 2;
      }
    }
    return parts.join("/");
  }
};

// exports

scope.componentLoader = componentLoader;
scope.loader = loader;

/*
scope = {
  xhr: xhr,
  makeDocument: makeDocument,
  loader: loader,
  componentLoader: componentLoader
};
*/

})(window.__exported_components_polyfill_scope__);
