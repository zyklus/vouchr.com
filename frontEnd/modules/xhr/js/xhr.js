$.provideModule('xhr', $.Observable.extend({
	init : function(params){
		this.loading = {};
		this.loaded  = {};
	},
	/**
	 * Valid Options:
	 *
	 * lazy      -- use cached results if they're available
	 * cache     -- cache the results once they come back
	 * reload    -- reload the results no matter what
	 * eventName -- sets the name of the event to fire with data.  If cache is not enabled, other modules MUST be listening at the time the XHR comes back.
	 */
	get : function(path, /*opt*/ data, cb, /*opt*/ opts){
		// TODO: error checking for params
		if(typeof(data) == 'function'){
			opts = cb;
			cb   = data;
			data = {};
		}
		opts = opts || {};

		if(opts.lazy){
			this.observe(opts.eventName || 'get: ' + path, cb);
			if(this.loading[path] || this.loaded[path]) { return; }
		}

		this.loading[path] = true;
		$.get(path, data, this.onData.bind(this, path, cb, opts));
	},
	onData : function(path, cb, opts, data){
		delete this.loading[path];

		if(opts.cache){
			this.loaded[path] = true;
		}
		this[opts.cache ? 'fireAndCache' : 'fire'](opts.eventName || 'get: ' + path, data);

		// if lazy-loading, the observer is already set up and the callback already fired due to the .fireAndCache call
		if(opts.lazy){ return; }

		cb(data);
	}
});