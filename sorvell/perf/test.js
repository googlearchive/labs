function test(tag) {
  addEventListener('load', function() { 
    run(tag);
  });
}

function run(tag) {
  var count = 50000;
  var start = performance.now();
  var frag = document.createDocumentFragment();
  for (var i = 0, n; i < count; i++) {
    frag.appendChild(document.createElement(tag));
  }
  document.body.appendChild(frag);
  var end = performance.now();
  var t = end - start;
  console.log('Time to generate ' + count + ' items: ' + (t / 1000) + 
    ' seconds, or ' + (Math.floor(t / count * 1e3) / 1e3) + 'ms/item');
}