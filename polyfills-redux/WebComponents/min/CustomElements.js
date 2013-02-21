/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function() {

var domCreateElement = document.createElement.bind(document);

// SECTION 4

function instantiate(inDefinition) {
  // 4.a.1. Create a new object that implements PROTOTYPE
  // 4.a.2. Let ELEMENT by this new object
  //
  // the custom element instantiation algorithm must also ensure that the
  // output is a valid DOM element with the proper wrapper in place.
  //
  var element = domCreateElement(inDefinition.tag);
  if (inDefinition.is) {
    element.setAttribute('is', inDefinition.is);
  }
  element = implement(element, inDefinition.prototype);
  var _elt = element;
  if (window.Nohd) {
    var _elt = SDOM(element);
    // attempt to publish our public interface directly
    // to our ShadowDOM polyfill wrapper object
    Object.keys(inDefinition.prototype).forEach(function(k) {
      //publishProperty(inDefinition.prototype, k, _elt);
      if (!(k in _elt)) {
        copyProperty(k, inDefinition.prototype, _elt);
      }
    });
  }
  if (inDefinition.lifecycle) {
    var created = inDefinition.lifecycle.created;
    if (created) {
      created.call(_elt);
    }
  }
  // OUTPUT
  return element;
}

function implement(inElement, inPrototype) {
  //var element = window.SDOM ? SDOM(inElement) : inElement;
  var element = inElement;
  if (Object.__proto__) {
    element.__proto__ = inPrototype;
  } else {
    // TODO(sjmiles):
    // probably can use something like this to truncate the 
    // prototype at the problem line for mixin
    // but it's complicated by SDOM
    /*
    var p = inPrototype;
    while (p && p.__proto__ !== inElement.__proto__) {
      p = p.__proto__;
    }
    if (window.SDOM) {
      p.__proto__ = element.__proto__;
    }
    */  
    mixin(element, inPrototype);
  }
  return element;
}

// FOO_CONSTRUCTOR = document.register(‘x-foo’, {
//   prototype: ELEMENT_PROTOTYPE,
//   lifecycle: {
//      created: CALLBACK
//   }
// });

function register(inName, inOptions) {
  //console.warn('document.register("' + inName + '", ', inOptions, ')');
  // construct a defintion out of options
  // TODO(sjmiles): probably should clone inOptions instead of mutating it
  var definition = inOptions || {};
  // must have a prototype, default to an extension of HTMLElement
  // TODO(sjmiles): probably should throw if no prototype, check spec
  definition.prototype = definition.prototype 
      || Object.create(HTMLUnknownElement.prototype);
  // extensions of native specializations of HTMLElement require localName
  // to remain native, and use secondary 'is' specifier for extension type
  // caller must specify a tag to declare a native localName
  definition.tag = definition.extends || inName;
  // if user declared a tag, use secondary 'is' specifier
  if (definition.extends) {
    definition.is = inName;
  }
  //definition.prototype.__definition__ = definition;
  // 7.1.5: Register the DEFINITION with DOCUMENT
  registerDefinition(inName, definition);
  // 7.1.7. Run custom element constructor generation algorithm with PROTOTYPE
  // 7.1.8. Return the output of the previous step.
  definition.ctor = generateConstructor(definition);
  return definition.ctor;
}

var registry = {};

function registerDefinition(inName, inDefinition) {
  registry[inName] = inDefinition;
}

function generateConstructor(inDefinition) {
  return function() {
    return instantiate(inDefinition);
  };
}

function createElement(inTag) {
  var definition = registry[inTag];
  if (definition) {
    return new definition.ctor();
  }
  return domCreateElement(inTag);
}

// utilities

// copy all properties from inProps (et al) to inObj
function mixin(inObj/*, inProps, inMoreProps, ...*/) {
  var obj = inObj || {};
  for (var i = 1; i < arguments.length; i++) {
    var p = arguments[i];
    // TODO(sjmiles): on IE we are using mixin
    // to generate custom element instances, as we have
    // no way to alter element prototypes after creation
    // (nor a way to create an element with a custom prototype)
    // however, prototype sources (inSource) are ultimately
    // chained to a native prototype (HTMLElement or inheritor)
    // and trying to copy HTMLElement properties to itself throwss
    // in IE
    // we don't actually want to copy those properties anyway, but I
    // can't find a way to determine if a prototype is a native
    // or custom inheritor of HTMLElement
    // ad hoc solution is to simply stop at the first exception
    // see 'implement' above for possible better solution
    try {
      for (var n in p) {
        copyProperty(n, p, obj);
      }
    } catch(x) {
      //console.log(x);
    }
  }
  return obj;
}

// copy property inName from inSource object to inTarget object
function copyProperty(inName, inSource, inTarget) {
  Object.defineProperty(inTarget, inName, 
      getPropertyDescriptor(inSource, inName));
}

// get property descriptor for inName on inObject, even if
// inName exists on some link in inObject's prototype chain
function getPropertyDescriptor(inObject, inName) {
  if (inObject) {
    var pd = Object.getOwnPropertyDescriptor(inObject, inName);
    return pd || getPropertyDescriptor(Object.getPrototypeOf(inObject));
  }
}

// exports

document.register = register;
document.createElement = createElement;

// TODO(sjmiles): temporary: control scope better
window.mixin = mixin;

})();

/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

// TODO(sjmiles): implement HTMLElementElement via document.register

HTMLElementElement = function(inElement) {
  // options to glean from inElement attributes
  var options = {
    name: '',
    extends: null
  };
  // glean them
  takeAttributes(inElement, options);
  // default base
  var base = HTMLUnknownElement.prototype;
  // optional specified base
  if (options.extends) {
    // get the prototype of an instance of options.extends
    // TODO(sjmiles): to get the actual DOM prototype we
    // have to avoid any SDOM override, so here we use
    // the prototypical createElement
    base = Object.getPrototypeOf(
        Object.getPrototypeOf(document).createElement.call(
            document, options.extends));
  }
  // extend base
  options.prototype = Object.create(base);
  // install lifecycle function
  inElement.register = function(inMore) {
    if (inMore) {
      options.lifecycle = inMore.lifecycle;
      if (inMore.prototype) {
        mixin(options.prototype, inMore.prototype);
      }
    }
  };
  // locate user script
  var script = inElement.querySelector("script");
  if (script) {
    // execute user script in 'inElement' context
    executeComponentScript(script.textContent, inElement, options.name);
  };
  // register our new element
  document.register(options.name, options);
  return inElement;
};

// invoke inScript in inContext scope
function executeComponentScript(inScript, inContext, inName) {
  // set (highlander) context
  context = inContext;
  // compose script
  var code = "__componentScript('" 
    + inName 
    + "', function(){"
    + inScript 
    + "});"
    + "\n//@ sourceURL=" + inContext.ownerDocument._URL + "\n"
  ;
  eval(code);
}

var context;

// global necessary for script injection
window.__componentScript = function(inName, inFunc) {
  inFunc.call(context);
};

// utilities

// each property in inDictionary takes a value
// from the matching attribute in inElement, if any
function takeAttributes(inElement, inDictionary) {
  for (var n in inDictionary) {
    var a = inElement.attributes[n];
    if (a) {
      inDictionary[n] = a.value;
    }
  }
}
/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

// highlander object represents a primary document (the argument to 'parse')
// at the root of a tree of documents
var componentDocument = {
  preloadSelectors: [
    'link[rel=components]',
    'script[src]',
    'link[rel=stylesheet]'
  ],
  parseSelectors: [
    'link[rel=components]',
    'script[src]',
    'element',
    'link[rel=stylesheet]'
  ],
  parseMap: {
    link: 'parseLink',
    script: 'parseScript',
    element: 'parseElement'
  },
  // document parsing is asynchronous
  parse: function(inDocument, inNext) {
    // resource bucket
    cd.resources = {};
    // first we preload all resources in the complete document tree
    cd.preload(inDocument, function() {
      // then we parse document content
      cd.continueParse(inDocument, inNext);
    });
  },
  preload: function(inDocument, inNext) {
    // all preloadable nodes in inDocument
    var nodes = inDocument.querySelectorAll(cd.preloadSelectors);
    // preload all nodes, call inNext when complete, call cd.eachPreload 
    // for each preloaded node
    loader.loadAll(nodes, inNext, cd.eachPreload);
  },
  eachPreload: function(data, next, url, elt) {
    // for document links
    if (elt.localName === 'link' && elt.getAttribute('rel') === 'components') {
      // generate an HTMLDocument from data
      var document = makeDocument(data, url); 
      // store document resource
      cd.resources[url] = makeDocument(data, url);
      // re-enters preloader here
      cd.preload(document, next);
    } else {
      // store othe resource
      cd.resources[url] = data;
      // no preprocessing on other nodes
      next();
    }
  },
  continueParse: function(inDocument, inNext) {
    // complete document tree is loaded at this point
    // begin parsing document content
    cd.parseElts(inDocument);
    // parsing complete
    inNext();
  },
  parseElts: function(inDocument) {
    if (inDocument) {
      // all parsable elements in inDocument (depth-first pre-order traversal)
      var elts = inDocument.querySelectorAll(cd.parseSelectors);
      // map of localNames to parser methods
      var map = cd.parseMap;
      // for each parsable node type in inDocument, call the mapped parsing method
      forEach(elts, function(e) {
        //console.log(map[e.localName] + ":", path.nodeUrl(e));
        cd[map[e.localName]](e);
      });
    }
  },
  parseLink: function(inLinkElt) {
    // rel=components
    if (inLinkElt.getAttribute('rel') === 'components') {
      cd.parseElts(cd.fetch(inLinkElt));
    } else {
    // rel=stylesheet
    }
  },
  parseScript: function(inScriptElt) {
    // ignore scripts in primary document, they are already loaded
    if (inScriptElt.ownerDocument === document) {
      return;
    }
    // evaluate now
    console.log(cd.fetch(inScriptElt) || '(no code)');
  },
  parseElement: function(inElementElt) {
    var element = window.SDOM ? SDOM(inElementElt) : inElementElt
    new HTMLElementElement(element);
  },
  fetch: function(inNode) {
    return cd.resources[path.nodeUrl(inNode)];
  }
};

var cd = componentDocument;

cd.preloadSelectors = cd.preloadSelectors.join(',');
cd.parseSelectors = cd.parseSelectors.join(',');

var makeDocument = function(inHTML, inUrl) {
  var doc = document.implementation.createHTMLDocument('component');
  doc.body.innerHTML = inHTML;
  doc._URL = inUrl;
  return doc;
};

loader = {
  load: function(inNode, inCallback) {
    xhr.load(path.nodeUrl(inNode), function(err, data, url) {
      inCallback(err, data, url);
    });
  },
  loadAll: function(inNodes, inNext, inEach) {
    if (!inNodes.length) {
      inNext();
    }
    var inflight = 0;
    function head(inElt) {
      inflight++;
      loader.load(inElt, function(err, data, url) {
        if (err) {
          tail();
        } else {
          each(data, tail, url, inElt);
        }
      });
    };
    function tail() {
      if (!--inflight) {
        inNext();
      };
    };
    var each = inEach || tail;
    forEach(inNodes, head);
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
  async: true,
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
          request.response, url);
      }
    });
    request.send();
  }
};

var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);
