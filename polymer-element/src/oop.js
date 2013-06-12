/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
 (function(scope) {
    // $super (`super` is a reserved word)
    
    // TODO(sjmiles):
    //    $super must be installed on an instance or prototype chain
    //    as `super`, and invoked via `this`, e.g.
    //
    //      `this.super();`
    //
    //    will not work if function objects are not unique, for example,
    //    when using mixins.
    //
    //    The memoization strategy assumes each function exists on only one 
    //    prototype chain i.e. we use the function object for memoizing)
    //    perhaps we can bookkeep on the prototype itself instead
    //
    function $super(inArgs) {
      // since we are thunking a method call, performance is important here: 
      // memoize all lookups, once memoized the fast path calls no other 
      // functions
      //
      // find the caller (cannot be `strict` because of 'caller')
      var caller = $super.caller;
      // memoization for 'name of method' 
      var nom = caller.nom;
      if (!nom) {
        nom = nameInThis.call(this, caller);
      }
      if (!nom) {
        console.warn('called super() on a method not in `this`');
      }
      // super prototype is either cached or we have to find it
      // by searching __proto__ (at the 'top')
      if (!('_super' in caller)) {
        memoizeSuper(caller, nom, Object.getPrototypeOf(this));
      }
      // memoized next implementation prototype
      var _super = caller._super;
      if (!_super) {
        // if _super is falsey, there is no super implementation
        //console.warn('called $super(' + nom + ') where there is no super implementation');
      } else {
        // our super function
        var fn = _super[nom];
        // memoize information so 'fn' can call 'super'
        if (!('_super' in fn)) {
          memoizeSuper(fn, nom, _super);
        }
        // invoke the inherited method
        // if 'fn' is not function valued, this will throw
        return fn.apply(this, inArgs || []);
      }
    }

    function nextSuper(proto, name, caller) {
      // look for an inherited prototype that implements inName
      while (proto && notSuper(proto, name, caller)) {
        proto = Object.getPrototypeOf(proto);
      }
      return proto;
    }

    function notSuper(proto, name, caller) {
      return !proto.hasOwnProperty(name) || proto[name] == caller;
    }

    function memoizeSuper(inMethod, inName, inProto) {
      // find and cache next prototype containing inName
      // we need the prototype so we can another lookup
      // from here
      inMethod._super = nextSuper(inProto, inName, inMethod);
      if (inMethod._super) {
        // _super is a prototype, the actual method is _super[inName]
        // tag super method with it's name for further lookups
        inMethod._super[inName]._nom = inName;
      }
    }

    function nameInThis(inValue) {
      console.warn('oop: invoked `nameInThis`');
      var p = this;
      while (p && p !== HTMLElement.prototype) {
        var n$ = Object.getOwnPropertyNames(p);
        for (var i=0, l=n$.length, n; i<l && (n=n$[i]); i++) {
          var d = Object.getOwnPropertyDescriptor(p, n);
          if (d.value == inValue) {
            return n;
          }
        }
        p = Object.getPrototypeOf(p);
      }
    }

    // exports
    
    scope.super = $super;
    
  })(Polymer);
