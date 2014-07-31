(function(exports) {
  var PROFILE = false;
  var TIMELINE = false;
  var MEASURE_RAF = false;
  var name, stats, hold, count, stop, importsReady, polymerReady, paintDone;
  var inPageTestFn, inPageTestStart, inPageTestTime, inPageTestPaintTime, finallyFn;
  var Stats = exports.Stats = {};
  var PREFIX = "polymer-stats-";
  var HOLD = 1000;
  var VER = 3;
  Stats.rerun = function() {
    localStorage.removeItem(PREFIX + name);
    setTimeout(function() {
      runGC();
      window.location.reload();
    }, 3000);
  }
  Stats.stop = function() {
    stop = true;
  }
  Stats.go = function(n, c, h) {
    name = n;
    count = c;
    hold = hold || HOLD;
    try {
      stats = JSON.parse(localStorage.getItem(PREFIX + name));
    } catch(e) {
    }
    if (!stats || (stats.ver != VER)) {
      stats = {
        ver: VER,
        count: 0,
        rafs: []
      };
    }
    Stats.data = stats;
  }
  Stats.print = function() {
    console.log(
      "Stats: " + name, "Iterations: " + stats.count + "\n" + navigator.userAgent + "\n=================\n" +
      print(stats, 'startToPlatform') + "\n" + 
      print(stats, 'startToImports') + "\n" + 
      print(stats, 'startToPolymer') + "\n" + 
      print(stats, 'startToPaint') + 
      (inPageTestFn ? ('\n' + print(stats, 'inPageTest') + '\n' + print(stats, 'inPageTestPaint')) : '')
    );
  }
  function print(stats, name) {
    var s = stats[name];
    return name + "\t"  + s.avg + "\t"  + s.stdev;
  }
  function accumulate(stats, name, time) {
    var s = stats[name];
    if (!s) {
      stats[name] = s = {total: 0, avg: 0, times: []};
    }
    s.times.push(time);
    s.total += time;
    s.avg = s.total / s.times.length;
    s.stdev = stdev(s);
  }
  function stdev(stats) {
    var sum = 0;
    for (var i=0; i<stats.times.length; i++) {
      sum += Math.pow(stats.times[i] - stats.avg, 2);
    }
    return Math.sqrt(sum / stats.times.length);
  }
  if (!window.HTMLImports) {
    waitForPaint();
  }
  window.addEventListener('HTMLImportsLoaded', function(e) {
    if (TIMELINE && console.timeline) {
      console.timeline();
    }
    importsReady = performance.now();
    if (!Polymer.api) {
      waitForPaint();
    }
  });
  window.addEventListener('polymer-ready', function(e) {
    polymerReady = performance.now();
      waitForPaint();
  });
  function waitForPaint() {
    requestAnimationFrame(function() {
      if (TIMELINE && console.timelineEnd) {
        console.timelineEnd();
      }
      paintDone = performance.now();
      if (inPageTestFn) {
        setTimeout(testInPage, HOLD/3);
      } else {
        finish();
      }
    });
  }
  function testInPage() {
    inPageTestStart = performance.now();
    inPageTestFn();
    inPageTestTime = performance.now() - inPageTestStart;
    rafCancelCnt = rafTimes.length+5;
    if (!MEASURE_RAF) {
      requestAnimationFrame(function() {
        inPageTestPaintTime = performance.now() - inPageTestStart;
        finish();
      });
    }
  }
  var rafLast = 0;
  var rafTimes = [];
  var rafDeltas = [];
  var rafCancelCnt;
  var rafs = {times: rafTimes, deltas: rafDeltas};
  function measureRAF() {
    var now = performance.now();
    if (rafCancelCnt && !rafs.testCnt) {
      rafs.testCnt = rafTimes.length;
      inPageTestPaintTime = now - inPageTestStart;
    }
    rafTimes.push(now.toFixed(1));
    rafDeltas.push((now - rafLast).toFixed(1));
    rafLast = now;
    if (!rafCancelCnt || rafTimes.length < rafCancelCnt) {
      requestAnimationFrame(measureRAF);
    } else {
      finish();
    }
  }
  if (MEASURE_RAF) {
    requestAnimationFrame(measureRAF);
  }
  function runGC() {
    if (window.gc) {
      window.gc();
      window.gc();
      window.gc();
      window.gc();
      window.gc();
      window.gc();
      window.gc();
      window.gc();
      window.gc();
      window.gc();
      window.gc();
    }
  }
  Stats.testInPage = function(fn) {
    inPageTestFn = fn;
  }
  Stats.doFinally = function(fn) {
    finallyFn = fn;
  }
  function finish() {
    stats.rafs.push(rafs);
    if (PROFILE && console.profileEnd) {
      console.profileEnd();
    }
    if (finallyFn) {
      finallyFn();
    }
    if (Platform.enableBindingsReflection) {
      console.log('Binding count', Stats.countBindings(document.body));    
    }
    if (stats) {
      stats.count++;
      accumulate(stats, 'startToPlatform', window.platformLoaded - window.docStart);
      accumulate(stats, 'startToImports', importsReady - window.docStart);
      accumulate(stats, 'startToPolymer', polymerReady - window.docStart);
      accumulate(stats, 'startToPaint', paintDone - window.docStart);
      if (inPageTestFn) {
        accumulate(stats, 'inPageTest', inPageTestTime);
        accumulate(stats, 'inPageTestPaint', inPageTestPaintTime);
      }
      if (count > 1) {
        Stats.print();
      } else {
        console.log('Single Run');
        console.log('=============');
        console.log('startToPlatform', window.platformLoaded - window.docStart);
        console.log('startToImports', importsReady - window.docStart);
        console.log('startToPolymer', polymerReady - window.docStart);
        console.log('startToPaint', paintDone - window.docStart);
        if (inPageTestFn) {
          console.log('inPageTest', inPageTestTime);
          console.log('inPageTestPaint', inPageTestPaintTime);
        }
      }
      localStorage.setItem(PREFIX + name, JSON.stringify(stats));
      if (count > stats.count && !stop) {
        setTimeout(function() {
          runGC();
          window.location.reload();
        }, hold);
      }
    }
  }
  Stats.countBindings = function(el) {
    el = wrap(el);
    var n = el.bindings_ ? Object.keys(el.bindings_).length : 0;
    var i;
    // Walk shadow roots
    if (el.shadowRoots) {
      for (var s in el.shadowRoots) {
        n += Stats.countBindings(el.shadowRoots[s]);
      }
    }
    // Walk children
    for (i=0; i<el.children.length; i++) {
      n += Stats.countBindings(el.children[i]);
    }
    // Walk text nodes
    for (i=0; i<el.childNodes.length; i++) {
      var cn = el.childNodes[i];
      cn = wrap(cn);
      if (!cn.localName && cn.nodeType != 11) {
        n += cn.bindings_ ? Object.keys(cn.bindings_).length : 0;
      }
    }
    // Walk distributed nodes
    if (el.localName == 'content') {
      var c = el.getDistributedNodes();
      for (i=0; i<el.childNodes.length; i++) {
        cn = el.childNodes[i];
        cn = wrap(cn);
        n += cn.bindings_ ? Object.keys(cn.bindings_).length : 0;
      }
    }
    return n;
  }
})(this);