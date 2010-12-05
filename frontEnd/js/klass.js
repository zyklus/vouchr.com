(function($){
	// Classes!
	var initializing = false;

	// The base klass implementation (does nothing)
	$.Klass = function(){};

	// Create a new klass that inherits from this class
	$.Klass.extend = function(prop) {
		var _super = this.prototype;

		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		initializing  = true;
		var prototype = new this();
		initializing  = false;

		// move special before and after cases
		for(var name in {before:1, after:1}){
			if(!prop[name]){ continue; }

			for(var n in prop[name]){
				prop['__' + name + '-' + n] = prop[name][n];
			}

			delete prop[name];
		}

		// Copy the properties over onto the new prototype
		for (var name in prop) {
			// Check if we have an array of functions.  If so, create a handler to route calls
			if(prop[name] instanceof Array && $.grep(prop[name], function(o){ return !(o instanceof Function); }).length==0){
				prop[name] = $.createDelegator(prop[name]);
			}

			// TODO: pass straight functions through when there is no before or after.
			//       to do this, we need to retroactively wrap protptype functions if
			//       a before or after function is in an inheriting class.

			// Check if we're overwriting an existing function
			prototype[name] = 
				typeof prop[name] == "function"
					? (function(name, fn){
						return function(){
							var before = this['__before-' + name], after = this['__after-' + name];

							before && ($.data(this, 'before-' + name) ? before = null : $.data(this, 'before-' + name, true));
							after  && ($.data(this, 'after-'  + name) ? after  = null : $.data(this, 'after-'  + name, true));

							before && before.apply(this, arguments);

							var tmp = this._super;

							// Add a new ._super() method that is the same method
							// but on the super-class
							this._super = _super[name];

							// The method only need to be bound temporarily, so we
							// remove it when we're done executing
							var ret = fn.apply(this, arguments);
							this._super = tmp;

							after && after.apply(this, arguments);

							before && ($.data(this, 'before-' + name, ''));
							after  && ($.data(this, 'after-'  + name, ''));

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

	$.Klass = $.Klass.extend({
		$property : function(name, value, event){
			var pC = name.substr(0, 1).toUpperCase() + name.substr(1),

			// back-up the existing functions, if they exist
			    set = this['set' + pC],
			    get = this['get' + pC],

			/*******
			 * do NOT normally do this since it usually unnecessarily creates a larger closure than is needed.
			 * In this case, however, we want pretty much everything here bound in the closure, so there's no need to use .bind()
			 *******/
			    self = this;

			// and bind the new ones
			this['set' + pC] = function(v){
				var val = set ? set.call(self, v) : v;

				if(value !== val){
					value = val;

					if(event && self.fireAndCache){
						self.fireAndCache(event, value);
					}
				}

				return this;
			}

			this['get' + pC] = function(){
				return get ? get.call(self, value) : value;
			}

			// call the old set function if there is a default value
			if(set && value){ set.call(self, value); }
		},

		bind : function(){
			var args = $A(arguments),
			    name = args.shift(),
			    self = this;

			return function(){
				return self[name].apply(self, args.concat( $A(arguments) ));
			};
		}
	});
})(jQuery);