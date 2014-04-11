/*
 * Copyright 2014 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
(function(scope) {
  var endOfMicrotask = scope.endOfMicrotask;

  // Generic url loader
  function Loader(regex) {
    this.regex = regex;
  }
  Loader.prototype = {
    // TODO(dfreedm): there may be a better factoring here
    // extract absolute urls from the text (full of relative urls)
    extractUrls: function(text, base) {
      var matches = [];
      var matched, u;
      while ((matched = this.regex.exec(text))) {
        u = new URL(matched[1], base);
        matches.push({matched: matched[0], url: u.href});
      }
      return matches;
    },
    // take a text blob, a root url, and a callback and load all the urls found within the text
    // returns a map of absolute url to text
    process: function(text, root, callback) {
      var matches = this.extractUrls(text, root);
      this.fetch(matches, {}, callback);
    },
    // build a mapping of url -> text from matches
    fetch: function(matches, map, callback) {
      var inflight = matches.length;

      // return early if there is no fetching to be done
      if (!inflight) {
        return callback(map);
      }

      var done = function() {
        if (--inflight === 0) {
          callback(map);
        }
      };

      // map url -> responseText
      var handleXhr = function(err, request) {
        var match = request.match;
        var key = match.url;
        // handle errors with an empty string
        if (err) {
          map[key] = '';
          return done();
        }
        var response = request.response || request.responseText;
        map[key] = response;
        this.fetch(this.extractUrls(response, key), map, done);
      };

      var m, req, url;
      for (var i = 0; i < inflight; i++) {
        m = matches[i];
        url = m.url;
        // if this url has already been requested, skip requesting it again
        if (map[url]) {
          // Async call to done to simplify the inflight logic
          endOfMicrotask(done);
          continue;
        }
        req = this.xhr(url, handleXhr, this);
        req.match = m;
        // tag the map with an XHR request to deduplicate at the same level
        map[url] = req;
      }
    },
    xhr: function(url, callback, scope) {
      var request = new XMLHttpRequest();
      request.open('GET', url, true);
      request.send();
      request.onload = function() {
        callback.call(scope, null, request);
      };
      request.onerror = function() {
        callback.call(scope, null, request);
      };
      return request;
    }
  };

  scope.Loader = Loader;
})(window.Platform);
