var fs = require('fs');
var path = require('path');
var wc = require('./wc-lib.js');

// return all files on commandline as absolute paths
function getFiles() {
  return process.argv.slice(2).map(path.resolve);
}

function concatElement(e) {
  buffer.push(wc.stripLinks(e));
}

function concat(inName) {
  if (!read[inName]) {
    console.log('Reading:', inName);
    read[inName] = 1;
    var content = fs.readFileSync(inName, 'utf8');
    var links = wc.extractLinks(inName, content);
    resolve(inName, links);
    var es = wc.extractElements(content);
    resolve(inName, es.reduce(function(a, b){ return a.concat(wc.extractLinks(inName, b)) }, []));
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
