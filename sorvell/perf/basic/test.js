var count = 5000;

function createDom(tag) {
  var frag = document.createDocumentFragment();
  for (var i = 0, n, e; i < count; i++) {
    frag.appendChild(document.createElement(tag));
  }
  document.body.appendChild(frag);
}

function test(action) {
  timeTest(action);
}

function timeTest(action) {
  var start = performance.now();
  action();
  var end = performance.now();
  var time = end - start;
  var itemTime = (time / count).toFixed(3);
  console.log('Time to generate ' + count + ' items: ' + time + 
    ' ms, or ' + itemTime + 'ms/item');
}

function profileTest(action) {
  console.profile('test');
  timeTest(action);
  console.profileEnd('test');
}