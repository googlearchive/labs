window.loadedImport = true;
console.log('script in', document.currentScript.ownerDocument.URL.split('/').pop(),
    document.currentScript.getAttribute('info'));