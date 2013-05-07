var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');
var nopt = require('nopt');

var options = nopt(
  {
    'output': path,
    'input': [path, Array],
    'verbose': Boolean
  },
  {
    'o': ['--output'],
    'i': ['--input'],
    'v': ['--verbose']
  }
);

if (!options.input) {
  console.error('No input files given');
  process.exit(1);
}

if (!options.output) {
  console.warn('Default output to output.html');
  options.output = path.resolve('output.html');
}

var IMPORTS = 'link[rel="import"][href]';
var ELEMENTS = 'element';

function concatElement(dir, e) {
  rewritePaths(dir, e);
  buffer.push(e);
}

function rewritePaths(e) {
  // TODO: make this rewrite css paths
  return e;
}

function readDocument(docname) {
  if (options.verbose) {
    console.log('Reading:', docname);
  }
  var content = fs.readFileSync(docname, 'utf8');
  return cheerio.load(content);
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
    es.forEach(concatElement.bind(this, dir));
  } else {
    if (options.verbose) {
      console.log('Dependency deduplicated');
    }
  }
}

function resolve(inName, inDependencies) {
  if (inDependencies.length > 0) {
    if (options.verbose) {
      console.log('Dependencies:', inDependencies);
    }
    inDependencies.forEach(concat);
  }
}

var buffer = [];
var read = {};

options.input.forEach(concat);

fs.writeFileSync(options.output, buffer.join('\n'), 'utf8');
