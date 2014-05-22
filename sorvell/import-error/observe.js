function isImport(element) {
  return element.localName === 'link' && element.rel === 'import';
}

function handleImports(element) {
  if (isImport(element)) {
    handleImport(element);
  }
  var e = element.firstElementChild;
  while(e) {
    handleImports(e);
    e = e.nextElementSibling;
  }
}

function handleImport(element) {
  var loaded = element.import;
  if (loaded) {
    console.log('observer: already loaded', element, 'resource', element.import);
  } else {
    element.addEventListener('load', function(e) {
      console.log('observer: loaded', e.target, 'resource', element.import);
    });
    element.addEventListener('error', function(e) {
      console.log('observer: error', e.target, 'resource', element.import);
    });
  }
}

function handleAddedNodes(nodes) {
  for (var i=0, l=nodes.length, n; (i<l) && (n=nodes[i]); i++) {
    if (isImport(n)) {
      handleImports(n);  
    }
    
  }
}

var mo = new MutationObserver(function(mxns) {
  for (var i=0, l=mxns.length, m; (i < l) && (m=mxns[i]); i++) {
    if (m.type === 'childList') {
      handleAddedNodes(m.addedNodes);
    }
  }
});

function observe(doc) {
  mo.observe(doc, {childList: true, subtree: true});      
}

observe(document.currentScript.ownerDocument);
console.log('import observation setup', document.currentScript.ownerDocument);
