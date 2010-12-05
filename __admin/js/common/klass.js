(function(root){
	// Classes!
	var initializing = false;

	// The base klass implementation (does nothing)
	root.Klass = function(){};

	// Create a new klass that inherits from this class
	root.Klass.extend = function(prop) {
		var _super = this.prototype;

		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		initializing  = true;
		var prototype = new this();
		initializing  = false;

		// Copy the properties over onto the new prototype
		for (var name in prop) {
			// Check if we have an array of functions.  If so, create a handler to route calls
			if(prop[name] instanceof Array && $.grep(prop[name], function(o){ return !(o instanceof Function); }).length==0){
				prop[name] = $.createDelegator(prop[name]);
			}

			// Check if we're overwriting an existing function
			prototype[name] = 
				typeof prop[name] == "function" && typeof _super[name] == "function"
					? (function(name, fn){
						return function() {
							var tmp = this._super;

							// Add a new ._super() method that is the same method
							// but on the super-class
							this._super = _super[name];

							// The method only need to be bound temporarily, so we
							// remove it when we're done executing
							var ret = fn.apply(this, arguments);
							this._super = tmp;

							return ret;
						};
					})(name, prop[name])

					: prop[name];
		}

		// The dummy class constructor
		function klass() {
			// All construction is actually done in the init method
			if(!initializing && this.init){
				this.init.apply(this, arguments);
			}
		}

		prototype.klass = {};

		// Populate our constructed prototype object
		klass.prototype = prototype;

		// Enforce the constructor to be what we expect
		klass.constructor = klass;

		// And make this class extendable
		klass.extend = arguments.callee;

		return klass;
	};
})(stc);