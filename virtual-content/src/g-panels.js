(function() {
  
  var gPanelsProto = {
    selected: 0,
    type: '',
    readyCallback: function() {
      if (!this.type) {
        this.type = 'fadeIn';
      }
      this.observeDom();
      this.job('applySelected');
    },
    observeDom: function() {
      var observer = new WebKitMutationObserver(this.childrenChanged.bind(this));
      observer.observe(this, {
        childList: true
      });
    },
    childrenChanged: function() {
      this.renderSelected();
    },
    selectedChanged: function(inOldValue) {
      this.lastSelected = inOldValue;
      this.job('applySelected');
    },
    applySelected: function() {
      this.from = this.panelAtSelectedValue(this.lastSelected);
      this.to = this.panelAtSelectedValue(this.selected);
      if (this.from && this.to && (this.from != this.to)) {
        this.from.style.display = this.to.style.display = null;
        this.animation.type = this.type;
        this.animation.target = this.from;
        var af = this.animation.apply();
        this.animation.target = this.to;
        var at = this.animation.apply();
        af.timing.playbackRate = -1;
        this.animation.type = 'par';
        var group = this.animation.apply();
        group.add(af, at);
        //console.log('applySelected', group);
        this.animation.play();
      } else {
        this.renderSelected();
      }
    },
    renderSelected: function() {
      var selectedPanel = this.panelAtSelectedValue(this.selected);
      Array.prototype.forEach.call(this.panels, function(p, i) {
        p.style.display = (p == selectedPanel) ? null : 'none';
      });
    },
    panelAtSelectedValue: function(inSelected) {
      var panel;
      Array.prototype.some.call(this.panels, function(p, i) {
        if ((i == inSelected) || (p.getAttribute('name') == inSelected) 
          || (p.getAttribute('name') == inSelected)) {
          panel = p;
          return true;
        }
      }, this);
      return panel;
    },
    get panels() {
      return this.children;
    },
    get animation() {
      if (!this._animation) {
        this._animation = document.createElement('g-animation');
        this._animation.type = this.type;
        this._animation.complete = function() {
          this.renderSelected();
        }.bind(this);
      }
      return this._animation;
    },
    typeChanged: function() {
      this._animation = null;
    }
  };
  
  document.utils.setupProperties(gPanelsProto);
  document.utils.job.bindTo(gPanelsProto);
  gPanelsProto.__proto__ = HTMLElement.prototype;
  document.register('g-panels', {
    prototype: gPanelsProto
  });
})();