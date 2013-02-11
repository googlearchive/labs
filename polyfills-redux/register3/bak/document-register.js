function register(inName, inExtends, inClass) {
  var ctor = makePrototypeTwiddlingConstructorForDomNodes(inExtends, inClass);
  addToTagRegistry(inName, ctor, inClass);
  ctor.super = getClassForExtendee(inClass);
  return ctor;
};

document.register = register;

// actual implementation in our polyfill is better, this is enough for here
function makePrototypeTwiddlingConstructorForDomNodes(inExtends, inClass) {
  var props = buildPropertyList(inClass.prototype);
  return function() {
    var instance = document.createElement(inExtends);
    inClass.call(instance);
    Object.defineProperties(instance, props);
    return instance;
  }
};

function buildPropertyList(obj) {
  var props = {};
  for (var n in obj) {
    props[n] = Object.getOwnPropertyDescriptor(obj, n);
  }
  return props;
};

function addToTagRegistry(inName, inCtor, inClass) {
  if (!window.registry) {
    registry = {};
  }
  registry[inName] = {ctor: inCtor, klass: inClass};
};

function getClassForExtendee(inExtends) {
  var record = registry[inExtends];
  return record && record.klass || function() {};
};

var dce = document.createElement;
document.createElement = function(inTagName) {
  var record = registry[inTagName];
  return record ? new record.ctor() : dce.call(document, inTagName);
};