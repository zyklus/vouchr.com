(function(){
	stc.api.observe('load', function(){
		var ajax = stc.api.ajax;

		$.extend(stc.api, {
			get: function( url, data, callback, type ) {
				// shift arguments if data argument was omited
				if ( jQuery.isFunction( data ) ) {
					type     = type || callback;
					callback = data;
					data     = null;
				}

				return stc.api.ajax({
					type     : "GET",
					url      : url,
					data     : data,
					success  : callback,
					dataType : type
				});
			},

			post: function( url, data, callback, type ) {
				// shift arguments if data argument was omited
				if ( jQuery.isFunction( data ) ) {
					type     = type || callback;
					callback = data;
					data     = {};
				}

				return stc.api.ajax({
					type     : "POST",
					url      : url,
					data     : data,
					success  : callback,
					dataType : type
				});
			},


			// when offline, capture all ajax calls and attempt to return a cached copy
			ajax : function(o){
				// TODO: capture this and store
				if(navigator.onLine){
					return ajax($.extend({}, o, {
						data    : (typeof o.data == 'string')
							? o.data + '&type=json'
							: $.extend({}, o.data, {type:'json'}),

						success : function(data){
							if(!data.errors && o.success){ return o.success.apply(o, arguments); }

							var errors = [];

							for(var i=0, l=(data.errors || []).length; i<l; i++){
								switch(data.errors[i].code){
									case 203: // invalid auth token
									case 300: // auth token missing
										showLogin();
										break;
									default:
										errors.push(data.errors[i].msg);
										break;
								}
							}

							if(errors.length){
								alert(errors.join('\n'));
							}
						}
					}));
				}

				var key   = o.url + '--' + JSON.stringify(o.data),
				    isGet = o.url.split('/')[1].indexOf('get') === 0;

				// if a get request, return the last known data
				// if not a get, store this as a to-do
				if(isGet && localStorage[key]){
					return localStorage[key];
				}
			}
		});
	});
})();