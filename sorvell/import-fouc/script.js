window.loadedImport = true;
console.log('script in', document.currentScript.ownerDocument.baseURI.split('/').pop(),
    document.currentScript.getAttribute('info'));