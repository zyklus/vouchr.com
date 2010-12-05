(function(window){
	window.stc = {
		__guid    : 0,
		guid      : function(){ return ++stc.__guid; }
	};

	$A = $.makeArray;

	$.extend(String.prototype, {
		interpolate : function(hash){
			out = this;
			for(n in hash){
				out = out.replace(new RegExp('#\\{' + n + '\\}', 'g'), hash[n]);
			}
			return out;
		},
		
		toProperCase : function(){
			var ary = this.split(' ');
			for(var i=0, l=ary.length; i<l; i++){
				ary[i] = ary[i][0].toUpperCase() + ary[i].substr(1).toLowerCase();
			}
			return ary.join(' ');
		}
	});

	$.extend(Function.prototype, {

		/*
		bind arguments to a function for callback purposes.
		First argument = scope, remaining arguments get passed to callback

		if scope evaluates to false, scope will get passed through
		*/
		bind : function() {
			var __method = this, args = $A(arguments), object = args.shift();
			return function() {
				return __method.apply(object || this, args.concat( $A(arguments) ));
			};
		},

		/*
		Calls a function once for each array of arguments passed to it.
		Scope is intially set to the function's scoped, but is reset to any
		non-Array elements passed in.
		*/
		each : function() {
			var scope = this, args;

			for(var i = 0, l = arguments.length; i < l; i++){
				args = arguments[i];
				if(args.constructor == Array){
					this.apply(scope, args);
				}else{
					scope = args;
				}
			}
		},

		// Returns a function that is wrapped in another function
		wrap : function(wrapper) {
			var __method = this;
			return function() {
				return wrapper.apply(this, [__method.bind(this)].concat($A(arguments)));
			};
		},

		wrapWithProcessing : function(pre, post, isClass){
			return this.wrap(function(func){
				var args = $A(arguments), res;
				args.shift();

				if(pre){
					if((res = pre.apply(this, args)) === false ) { return; }
					if(res instanceof Array){
						for(var i=0, l=res.length; i<l; i++){
							if(res[i] == undefined){ continue; }
							args[i] = res[i];
						}
					}
				}

				var res = isClass
					? func.apply({}, args)
					: func.apply(this, args)

				if(post){
					return post.call(this, res);
				}

				return res;
			});
		},

		curry : function() {
			var __method = this, args = $A(arguments);
			return function() {
				return __method.apply(this, args.concat($A(arguments)));
			};
		},

		delay : function() {
			var __method = this, args = $A(arguments), timeout = args.shift() * 1000;
			return window.setTimeout(function() {
				return __method.apply(__method, args);
			}, timeout);
		},

		// returns a globally unique string that refers to the name of the current function
		globalReference : function(){
			if(!this.guid){
				this.guid = stc.guid();
				stc['globalRef' + this.guid] = this;
			}

			return 'stc.globalRef' + this.guid;
		},

		argumentNames : function() {
			var names = this.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
				.replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
				.replace(/\s+/g, '').split(',');
			return names.length == 1 && !names[0] ? [] : names;
		}
	});

	$.extend(Function.prototype, {
		defer : Function.prototype.delay.curry(0.001)
	});

	// add browser identifier classes to body on page load
	$(function(){
		for(n in $.browser){
			if(n=='version' || n=='safari'){ continue; }

			$(document.body).addClass(n);
		}
		var v = $.browser['version'].split('.');
		while(v.length>0){
			$(document.body).addClass('v' + v.join('.'));
			v.pop();
		}
	});

	$.extend($.fn, {
		findAll : function(expr){
			return this.filter(expr).add(this.find(expr));
		}
	});

	$.extend($.expr[':'], {
		data : function(elem, i, match) {
			var pieces = ((pieces = $(/^\s*((?:[\w_-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*$/.exec(match[3])))
				.filter(function(i){
					return i>0 && i!=3 && !!pieces[i];
				})),
				type  = pieces[1],
				check = pieces[2],
				data  = $.data(elem, pieces[0]),
				value = data + '';

				return data ==  null
					? type  === "!="
					: type  === "="
					? value === check
					: type  === "*="
					? value.indexOf(check) >= 0
					: type  === "~="
					? (" " + value + " ").indexOf(check) >= 0
					: !check
					? value && data !== false
					: type  === "!="
					? value  != check 
					: type  === "^="
					? value.indexOf(check) === 0
					: type  === "$="
					? value.substr(value.length - check.length) === check
					: type  === "|="
					? value === check || value.substr(0, check.length + 1) === check + "-"
					: false;
			}
	});
})(window);