(function() {
  var testFrames = 100;
  var testStep = 5000;

  function test() {
    var list = document.querySelector('#lt');
    var testStart = Date.now();
    var frames = 0;
    function next() {
      list.$.list.scrollOffset += testStep;
      frames++;
      if (frames < testFrames) {
        requestAnimationFrame(next);
      } else {
        console.log('time/frame: %fms',
           (Date.now() - testStart) / testFrames);
      }
    }
    requestAnimationFrame(next);
  }
  
  window.test = test;
})();