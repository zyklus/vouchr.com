(function(window, $){
	window.$A = $.makeArray;

	$.extend(String.prototype, {
		interpolate : function(hash){
			var out = this;
			for(n in hash){
				out = out.replace(new RegExp('#\\{' + n + '\\}', 'g'), hash[n]);
			}
			return out;
		},

		sprintf : function(){
			var out = this;
			for(var i=0, l=arguments.length; i<l; i++){
				out = out.replace('%s', arguments[i]);
			}
			return out;
		},

		toProperCase : function(keepUpperCase){
			var ary = this.split(' ');
			for(var i=0, l=ary.length; i<l; i++){
				ary[i] = ary[i][0].toUpperCase() + (keepUpperCase ? ary[i].substr(1) : ary[i].substr(1).toLowerCase());
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
				this.guid = $.guid++;
				$['globalRef' + this.guid] = this;
			}

			return '$.globalRef' + this.guid;
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

	$.extend(jQuery.Event.prototype, {
		stop : function(ev){
			this.preventDefault();
			this.stopPropagation();
		}
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
		},

		noop : function(){ return this; }
	});

	$.extend(Math, {
		constrain : function(num, min, max){
			return num < min ? min : num > max ? max : num;
		}
	});

	$.extend({
		constructURL: function(base, href){
			return (((href.indexOf(':') > 0) || (href.indexOf('./') == 0)) ? '' : base) + href;
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

	(function($) {
		$.toJSON = function(o){
			if (typeof(JSON) == 'object' && JSON.stringify){ return JSON.stringify(o); }

			var type = typeof(o);

			if (o === null){ return "null"; }

			if (type == "undefined"){ return undefined; }

			if (type == "number" || type == "boolean"){ return o + ""; }

			if (type == "string"){ return quoteString(o); }

			if (type == 'object'){
				if (typeof o.toJSON == "function"){ return $.toJSON(o.toJSON()); }

				if (o.constructor === Date){
					var month = o.getUTCMonth() + 1;
					if (month < 10) month = '0' + month;

					var day = o.getUTCDate();
					if (day < 10) day = '0' + day;

					var year = o.getUTCFullYear();

					var hours = o.getUTCHours();
					if (hours < 10) hours = '0' + hours;

					var minutes = o.getUTCMinutes();
					if (minutes < 10) minutes = '0' + minutes;

					var seconds = o.getUTCSeconds();
					if (seconds < 10) seconds = '0' + seconds;

					var milli = o.getUTCMilliseconds();
					if (milli < 100) milli = '0' + milli;
					if (milli < 10) milli = '0' + milli;

					return '"' + year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':' + seconds +  '.' + milli + 'Z"'; 
				}

				if(o.constructor === Array) {
					var ret = [];
					for (var i = 0; i < o.length; i++){
						ret.push( $.toJSON(o[i]) || "null" );
					}

					return "[" + ret.join(",") + "]";
				}

				var pairs = [];
				for (var k in o) {
					var name;
					var type = typeof k;

					if (type == "number"){
						name = '"' + k + '"';
					}else if (type == "string"){
						name = quoteString(k);
					}else{
						continue;  //skip non-string or number keys
					}

					if(typeof o[k] == "function"){ continue; }

					var val = $.toJSON(o[k]);

					pairs.push(name + ":" + val);
				}

				return "{" + pairs.join(", ") + "}";
			}
		};

		$.evalJSON = function(src){
			if (typeof(JSON) == 'object' && JSON.parse){ return JSON.parse(src); }
			return (new Function('return ' + src))();
		};

		function quoteString(string){
			if (string.match(_escapeable)){
				return '"' + string.replace(_escapeable, function(a){
					var c = _meta[a];
					if (typeof c === 'string') return c;
						c = a.charCodeAt();
						return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
					}) + '"';
			}

			return '"' + string + '"';
		};

		var _escapeable = /["\\\x00-\x1f\x7f-\x9f]/g;

		var _meta = {
			'\b': '\\b',
			'\t': '\\t',
			'\n': '\\n',
			'\f': '\\f',
			'\r': '\\r',
			'"' : '\\"',
			'\\': '\\\\'
		};
	})($);
})(window, jQuery);