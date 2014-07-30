Stats is a that can be added to any polymer page that measures the time from page load to key events.  This is done by re-loading the page a (configurable) number of times, recording the measurements for each run in localStorage, and calculating averages/stdev.  Measurements include:

* Time to platform loaded
* Time to HTMLImportsLoaded
* Time to polymer-ready
* Time to paint (first RAF) after polymer-ready
* Optionally, the time to synchronously execute a given operation in the page after the page loads, as well as the time to first paint (first RAF) after that operation

Note it is critically important when measuring time from page load to pay attention to variance in the measurement, as the server/network variable can add extreme outliers in small-n runs.

## To use:

1. Add this to top of page, to shim performance.now() for Safari:

		<script>
		  window.performance = window.performance||(function(){var g=Date.now();return {now:function(){return Date.now()-g;}}})();
		  window.docStart = window.docStart || performance.now();
		  document.querySelector('script').remove();
		</script>

2. In order to measure time to platform loaded, add this directly after `platform.js` script:

		<script>window.platformLoaded = performance.now();</script>

3. Add stats script and call `go` with an arbitrary name and count of iterations to average over:

		<script src="labs/kschaaf/stats/stats.js"></script>
		<script>
		  Stats.go('learn-tabs', 20);
		</script>

4. To start a new test, open the inspector and call:

		Stats.rerun();
		
	After calling `rerun`, you have 3 seconds to close the inspector.  Depending on the platform and inspector tab that is visible, having the inspector open can *dramatically* affect the performance of the page, so the inspector should always be closed when 
	
## Optional hooks

To add an in-page text (e.g. measure time to create an element), add this code:

		<script>
		  Stats.testInPage(function() {
		    // Add code to run after page has loaded, e.g.:
		    var el = document.createElement('learn-tabs');
		    document.body.appendChild(el);
		  });
		</script>
		
To add logging code to run after the page has loaded (and any test in page has run), add this code:

		<script>
		  Stats.doFinally(function() {
		    console.log('binding count', Stats.countBindings(document.body));    
		  });
		</script>
		
The stats script will automatically count and output the number of bindings on the page if `Platform.enableBindingsReflection` is set true:

	  <script>
	    Platform.enableBindingsReflection = true;
	  </script>	

Hence above `doFinally` example is actually not useful, but doFinally could be used for other purposes.


## Example

	<!doctype html>
	<html>
	<head>
	  <title>Learn tabs smoke test</title>
	<script>
	  window.performance = window.performance||(function(){var g=Date.now();return {now:function(){return Date.now()-g;}}})();
	  window.docStart = window.docStart || performance.now();
	  document.querySelector('script').remove();
	</script>
	
	  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
	  <meta name="mobile-web-app-capable" content="yes">
	  <meta name="apple-mobile-web-app-capable" content="yes">
	
	  <script src="../components/platform-dev/platform.js"></script>
	  <script>
	    Platform.enableBindingsReflection = true;
	  </script>
	  <script>window.platformLoaded = performance.now();</script>
	
	  <script src="http://172.17.26.240/dev/polymer/labs/kschaaf/stats/stats.js"></script>
	  <script>
	    Stats.testInPage(function() {
	      var el = document.createElement('paper-button');
	      el.label = 'paper-button';
	      document.body.appendChild(el);
	    });
	    Stats.go('learn-tabs', 20);
	  </script>
	 
	  <link rel="import" href="../components/paper-button/paper-button.html">
	
	  <paper-button label="paper-button"></paper-button>
	
	</head>
	<body unresolved>
	  
	</body>
	</html>