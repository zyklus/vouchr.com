(function(){
	wrapper = new ($.Observable.extend({
		init : function(){
			this._super();
			this.watching = {};
		},

		wrap : function(){
			$.api.get  = this.get;
			$.api.post = this.post;
			$.api.ajax = this.ajax;

			// prevent the functions from being wrapped twice
			this.wrap = $.noop;
		},

		get : function( url, data, callback, type ) {
			// shift arguments if data argument was omited
			if ( $.isFunction( data ) ) {
				type     = type || callback;
				callback = data;
				data     = null;
			}

			return this.ajax({
				type     : "GET",
				url      : url,
				data     : data,
				success  : callback,
				dataType : type
			});
		},

		post : function( url, data, callback, type ) {
			// shift arguments if data argument was omited
			if ( jQuery.isFunction( data ) ) {
				type     = type || callback;
				callback = data;
				data     = {};
			}

			return this.ajax({
				type     : "POST",
				url      : url,
				data     : data,
				success  : callback,
				dataType : type
			});
		},

		ajax : function(){
			console.log('here');
			return $.api.ajax.apply($, arguments);
			return $.api.ajax($.extend({}, o, {
				data    : (typeof o.data == 'string')
					? o.data + '&type=json'
					: $.extend({}, o.data, {type:'json'}),

				success : this.bind('handleResponse', o)
			}));
		}
	}))();

	$.modules.provide('api-wrapper', {init : function(){
		return wrapper;
	}});
})();