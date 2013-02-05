(function() {
  var inspector;

  window.xinspect = function(inNode) {
    if (!inspector) {
      inspector = window.open('', 'ShadowDOM Inspector');
      inspector.document.write(extractHtml(containHtml.toString()));
      inspector.document.close();
    }
    inspect(inNode);
  };

  var inspect = function(inNode) {
    inspector.document.body.innerHTML = '<pre>' + output(inNode, inNode.childNodes) + '</pre>';
  };

  var containHtml = function() {
  /*
  <!DOCTYPE html>
  <!--
  Copyright 2012 The Toolkitchen Authors. All rights reserved.
  Use of this source code is governed by a BSD-style
  license that can be found in the LICENSE file.
  -->
  <html>
    <head>
      <title>ShadowDOM Inspector</title>
      <style>
        body {
        }
        pre {
          font: 9pt "Courier New", monospace;
          line-height: 1.5em;
        }
        tag {
          color: purple;
        }
      </style>
    </head>
    <body>
    </body>
  </html>
  */
  };

  var extractHtml = function(inCode) {
      var rx = /\/\*[\w\t\n\r]*([\s\S]*?)[\w\t\n\r]*\*\//;
      var html = inCode.toString().match(rx)[1];
      return html;
  };

  var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);

  var output = function(inNode, inChildNodes, inIndent) {
    var indent = inIndent || '';
    if (inNode.localName) {
      var info = indent + describe(inNode);
      // if only textNodes
      // TODO(sjmiles): make correct for ShadowDOM
      if (!inNode.children.length) {
        info += catTextContent(inChildNodes);
      } else {
        info += '<br/>';
        var ind = indent + '&nbsp;&nbsp;';
        forEach(inChildNodes, function(n) {
          info += output(n, n.childNodes, ind);
        });
        info += indent;
      }
      info += '<tag>&lt;/' + inNode.localName + '&gt;</tag>' + '<br/>';
    } else {
      var text = inNode.textContent.trim();
      info = text ? indent + '"' + text + '"' + '<br/>' : '';
    }
    return info;
  };

  var catTextContent = function(inChildNodes) {
    var info = '';
    forEach(inChildNodes, function(n) {
      info += n.textContent.trim();
    });
    return info;
  };

  var describe = function(inNode) {
    var tag = '<tag>' + '&lt;' + inNode.localName;
    forEach(inNode.attributes, function(a) {
      tag += ' ' + a.name + (a.value ? '="' + a.value + '"' : '');
    });
    if (Math.random() < 0.5) {
      tag += ' <button>shadow</button>';
    }
    tag += '&gt;'+ '</tag>';
    return tag;
  };

})();


