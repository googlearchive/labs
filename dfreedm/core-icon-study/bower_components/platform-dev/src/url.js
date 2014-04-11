/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {

var urlResolver = {
  resolveDom: function(root, url) {
    url = url || root.ownerDocument.baseURI;
    this.resolveAttributes(root, url);
    this.resolveStyles(root, url);
    // handle template.content
    var templates = root.querySelectorAll('template');
    if (templates) {
      for (var i = 0, l = templates.length, t; (i < l) && (t = templates[i]); i++) {
        if (t.content) {
          this.resolveDom(t.content, url);
        }
      }
    }
  },
  resolveTemplate: function(template) {
    this.resolveDom(template.content, template.ownerDocument.baseURI);
  },
  resolveStyles: function(root, url) {
    var styles = root.querySelectorAll('style');
    if (styles) {
      for (var i = 0, l = styles.length, s; (i < l) && (s = styles[i]); i++) {
        this.resolveStyle(s, url);
      }
    }
  },
  resolveStyle: function(style, url) {
    url = url || style.ownerDocument.baseURI;
    style.textContent = this.resolveCssText(style.textContent, url);
  },
  resolveCssText: function(cssText, baseUrl) {
    cssText = replaceUrlsInCssText(cssText, baseUrl, CSS_URL_REGEXP);
    return replaceUrlsInCssText(cssText, baseUrl, CSS_IMPORT_REGEXP);
  },
  resolveAttributes: function(root, url) {
    if (root.hasAttributes && root.hasAttributes()) {
      this.resolveElementAttributes(root, url);
    }
    // search for attributes that host urls
    var nodes = root && root.querySelectorAll(URL_ATTRS_SELECTOR);
    if (nodes) {
      for (var i = 0, l = nodes.length, n; (i < l) && (n = nodes[i]); i++) {
        this.resolveElementAttributes(n, url);
      }
    }
  },
  resolveElementAttributes: function(node, url) {
    url = url || node.ownerDocument.baseURI;
    URL_ATTRS.forEach(function(v) {
      var attr = node.attributes[v];
      if (attr && attr.value &&
         (attr.value.search(URL_TEMPLATE_SEARCH) < 0)) {
        var urlPath = resolveRelativeUrl(url, attr.value);
        attr.value = urlPath;
      }
    });
  }
};

var CSS_URL_REGEXP = /(url\()([^)]*)(\))/g;
var CSS_IMPORT_REGEXP = /(@import[\s]+(?!url\())([^;]*)(;)/g;
var URL_ATTRS = ['href', 'src', 'action'];
var URL_ATTRS_SELECTOR = '[' + URL_ATTRS.join('],[') + ']';
var URL_TEMPLATE_SEARCH = '{{.*}}';

function replaceUrlsInCssText(cssText, baseUrl, regexp) {
  return cssText.replace(regexp, function(m, pre, url, post) {
    var urlPath = url.replace(/["']/g, '');
    urlPath = resolveRelativeUrl(baseUrl, urlPath);
    return pre + '\'' + urlPath + '\'' + post;
  });
}

function resolveRelativeUrl(baseUrl, url) {
  var u = new URL(url, baseUrl);
  return makeDocumentRelPath(u.href);
}

function makeDocumentRelPath(url) {
  var root = document.baseURI;
  var u = new URL(url, root);
  if (u.host === root.host && u.port === root.port &&
      u.protocol === root.protocol) {
    return makeRelPath(root.pathname, u.pathname);
  } else {
    return url;
  }
}

// make a relative path from source to target
function makeRelPath(source, target) {
  var s = source.split('/');
  var t = target.split('/');
  while (s.length && s[0] === t[0]){
    s.shift();
    t.shift();
  }
  for (var i = 0, l = s.length - 1; i < l; i++) {
    t.unshift('..');
  }
  return t.join('/');
}

// exports
scope.urlResolver = urlResolver;

})(Platform);
