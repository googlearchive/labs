function handleLinks(element) {
  if (element.localName === 'link') {
    handleLink(element);
  }
  var e = element.firstElementChild;
  while(e) {
    handleLinks(e);
    e = e.nextElementSibling;
  }
}

function handleLink(link) {
  var loaded = (link.rel === 'stylesheet' && link.sheet) ||
      (link.rel === 'import' && link.import);
  if (loaded) {
    console.log('observer: already loaded', link, 'resource', link.import || link.sheet);
  } else {
    link.addEventListener('load', function(e) {
      console.log('observer: loaded', e.target, 'resource', link.import || link.sheet);
      // too late.
      /*
      if (e.target.import) {
        observe(e.target.import);
      }
      */
    });
  }
}

function handleAddedNodes(nodes) {
  for (var i=0, l=nodes.length, n; (i<l) && (n=nodes[i]); i++) {
    if (n.localName === 'link') {
      handleLinks(n);  
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
