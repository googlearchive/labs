var count = 0;

function createTemplate(template, data) {
  if (!Array.isArray(data)) {
    var o = [];
    for (var i=0; i< data; i++) {
      o.push(i);
    }
    data = o;
  }
  count = data.length;

  var clone = template.cloneNode(true);
  document.body.appendChild(clone);
  clone.bindingDelegate = new PolymerExpressions();
  clone.setAttribute('repeat', '');
  clone.model = data;
}

function test(template, data) {
  timeTest(function() {
    createTemplate(template, data);
  });
}

function timeTest(action) {
  var start = performance.now();
  action();
  new MutationObserver(function() {
    requestAnimationFrame(function() {
      var end = performance.now();
      var time = end - start;
      var itemTime = (time / count).toFixed(3);
      console.log('Time to generate ' + count + ' items: ' + time + 
        ' ms, or ' + itemTime + 'ms/item');
    });
  }).observe(document.body, {childList: true});
  
}
