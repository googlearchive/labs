var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');

var IMPORTS = 'link[rel="import"][href]';
var ELEMENTS = 'element';

// return all files on commandline as absolute paths
function getFiles() {
  return process.argv.slice(2).map(function(p){ return path.resolve(p) });
}

function concatElement(e) {
  rewritePaths(e);
  buffer.push(e);
}

function rewritePaths(e) {
  // TODO: make this rewrite css paths
  return e;
}

function readDocument(docname) {
  console.log('Reading:', docname);
  var content = fs.readFileSync(docname, 'utf8');
  return cheerio.load(content, {ignoreWhitespace: true});
}

function extractImports(doc) {
  return doc(IMPORTS).map(function(i, e){ return doc(e).attr('href') });
}

function resolvePath(dirname, relpath) {
  return path.resolve(dirname, relpath);
}

function extractElements(doc) {
  return doc(ELEMENTS).map(function(i, e){ return doc.html(e) });
}

function concat(filename) {
  if (!read[filename]) {
    read[filename] = true;
    var doc = readDocument(filename);
    var dir = path.dirname(filename);
    var links = extractImports(doc);
    links = links.map(resolvePath.bind(this, dir));
    resolve(filename, links);
    var es = extractElements(doc);
    es.forEach(concatElement);
  } else {
    console.log('Dependency deduplicated');
  }
}

function resolve(inName, inDependencies) {
  if (inDependencies.length > 0) {
    console.log('Dependencies:', inDependencies);
    inDependencies.forEach(concat);
  }
}

var files = getFiles();
var buffer = [];
var read = {};

files.forEach(concat);

fs.writeFileSync('output.html', buffer.join('\n'), 'utf8');
