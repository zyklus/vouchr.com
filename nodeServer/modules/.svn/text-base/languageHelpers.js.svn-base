var $A = exports.$A = function $A(ary){
	var a = [];

	for(var i=0, l=ary.length; i<l; i++){
		a.push(ary[i]);
	}

	return a;
};

var extend = exports.extend = function extend(){
	var args = $A(arguments),
	  target = args.shift();

	for(var i=0, l=args.length; i<l; i++){
		if(!args[i]){ continue; }

		for(var n in args[i]){
			target[n] = args[i][n];
		}
	}

	return target;
};

var each = exports.each = function each(ary, cb){
	for(var i=0, l=ary.length; i<l; i++){
		cb(i, ary[i]);
	}
};

extend(Function.prototype, {
	bind : function() {
		var __method = this, args = $A(arguments), object = args.shift();
		return function() {
			return __method.apply(object || this, args.concat( $A(arguments) ));
		};
	},

	curry : function() {
		var __method = this, args = $A(arguments);
		return function() {
			return __method.apply(this, args.concat($A(arguments)));
		};
	},

	defer : function(time){
		var __method = this;

		setTimeout(function(){ __method.apply(__method); }, time || 1);

		return this;
	}
});

var isFunction = exports.isFunction = function(obj){
	return toString.call(obj) === "[object Function]";
};

var isObject = exports.isObject = function(obj){
	return toString.call(obj) === "[object Object]";
};

var isString = exports.isString = function(obj){
	return toString.call(obj) === "[object String]";
};

var isUndefined = exports.isUndefined = function(obj){
	return obj === undefined;
}

extend(Array, {
	remove : function(ary, val){
		for(var i=ary.length-1; i>=0; i--){
			if(ary[i] === val){ delete ary[i]; }
		}

		return ary;
	}
});

extend(String.prototype, {
	trim : function(){
		return this.replace(/^\s+|\s+$/g, '');
	},

	interpolate : function(hash){
		var out = this, rep;

		(rep = function(hash, root){
			for(n in hash){
				if(typeof(hash[n]) == 'object'){
					rep(hash[n], root + n + '.');
				}else{
					out = out.replace(new RegExp('#\\{' + root + n + '\\}', 'g'), hash[n]);
				}
			}
		})(hash, '');
		return out;
	},

	sprintf : function(){
		var out = this;
		for(var i=0, l=arguments.length; i<l; i++){
			out = out.replace('%s', arguments[i]);
		}
		return out;
	},

	toProperCase : function(){
		var ary = this.split(' ');
		for(var i=0, l=ary.length; i<l; i++){
			ary[i] = ary[i][0].toUpperCase() + ary[i].substr(1).toLowerCase();
		}
		return ary.join(' ');
	},

	toUpperCaseFirst : function(){
		return this[0].toUpperCase() + this.substr(1);
	},
});