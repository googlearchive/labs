/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
(function(scope) {

  // imports

  var log = window.logFlags || {};
  var api = scope.api.declarative.styles;
  var STYLE_SCOPE_ATTRIBUTE = api.STYLE_SCOPE_ATTRIBUTE;
  
  // magic words
  
  var STYLE_CONTROLLER_SCOPE = 'controller';
  
  var styles = {
    /**
     * Installs external stylesheets and <style> elements with the attribute 
     * polymer-scope='controller' into the scope of element. This is intended
     * to be a called during custom element construction. Note, this incurs a 
     * per instance cost and should be used sparingly.
     *
     * The need for this type of styling should go away when the shadowDOM spec
     * addresses these issues:
     * 
     * https://www.w3.org/Bugs/Public/show_bug.cgi?id=21391
     * https://www.w3.org/Bugs/Public/show_bug.cgi?id=21390
     * https://www.w3.org/Bugs/Public/show_bug.cgi?id=21389
     * 
     * @param element The custom element instance into whose controller (parent)
     * scope styles will be installed.
     * @param elementElement The <element> containing controller styles.
    */
    // TODO(sorvell): remove when spec issues are addressed
    installControllerStyles: function(elementElement) {
      if (!elementElement.controllerStyle) {
        elementElement.controllerStyle = elementElement.styleForScope(
            STYLE_CONTROLLER_SCOPE);
      }
      var styleElement = elementElement.controllerStyle;
      //
      var scope = Polymer.findStyleController(this);
      // apply controller styles only if they are not yet applied
      if (scope && !this.scopeHasElementStyle(scope, STYLE_CONTROLLER_SCOPE)) {
        Polymer.shimPolyfillDirectives([styleElement], this.localName);
        Polymer.applyStyleToScope(styleElement, scope);
      }
    },
    scopeHasElementStyle: function(scope, descriptor) {
      return scope.querySelector('style[' + STYLE_SCOPE_ATTRIBUTE + '=' + 
          this.localName + '-' + descriptor + ']');
    },
    findStyleController: function() {
      // find the shadow root that contains inNode
      var n = this;
      while (n.parentNode) {
        n = n.parentNode;
      }
      return n == document ? document.head : n;
    }
  };

  // exports

  scope.api.instance.styles = styles;
  
})(Polymer);
