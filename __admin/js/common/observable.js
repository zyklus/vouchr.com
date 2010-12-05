(function(root){
	root.Observable = root.Klass.extend({
		init : function(){
			this.observing = {};
			this.queue     = {}; // a queue of events that were called in the wrong order.  Fire when possible.
			this.cache     = {};
		},

		/* - event(s) on which this should fire (can be an array)
		 * - callback to fire
		 * - events that have to have already fired for this to occur (can be an array)
		 *
		 * In english (I hope): You're trying to observe an event, but another event MUST be run first (it gets data, etc).  Observe the event normally, and add the required event to the 3rd arg
		 */

		observe : function(events, callback, reqEvents){
			events    = events    ? [].concat(events)    : []
			reqEvents = reqEvents ? [].concat(reqEvents) : [];

			// generate a hash for the array
			for(var i=0, l=reqEvents.length; i<l; i++){
				reqEvents[reqEvents[i]] = i;
			}

			for(var i=0, l=events.length, obj; i<l; i++){
				(this.observing[events[i]] = this.observing[events[i]] || []).push(obj = {cb:callback, req:reqEvents});

				// check to see if we already have data for this event in the cache
				if(this.cache[events[i]]){
					this.triggerEvent(obj, this.cache[events[i]]);
					this.checkQueue(events[i]);
				}
			}			

			return this;
		},

		stopObserving : function(event, callback){
			if(!this.observing[event]){ return; }

			for(var e=this.observing[event] || [], i=e.length-1; i>=0; i--){
				if(callback && (e[i].cb != callback)){ continue; }

				e.splice(i, 1);
			}

			return this;
		},

		triggerEvent : function(e, args){
			// this function isn't ready to be called yet.  Queue it up.
			if(e.req.length>0){
				var obj = {args: args, obj:e};
				for(var j=0, m=e.req.length; j<m; j++){
					(this.queue[e.req[j]] = this.queue[e.req[j]] || []).push(obj);
				}
			}else{
				// fire all events that have no required events left to fire
				e.cb.apply(this, args);
			}

			return this;
		},

		checkQueue : function(event){
			// loop everything in the queue for this event
			for(var i=0, e=this.queue[event] || [], l=e.length; i<l; i++){
				e[i].obj.req.splice(e[i].obj.req[event], 1);

				// event can be fired now
				if(e[i].obj.req.length == 0){
					e[i].obj.cb.apply(this, e[i].args);
				}
			}
		},

		fire : function(event){
			var args = $A(arguments);
			args.shift();

			for(var i=0, e=this.observing[event] || [], l=e.length; i<l; i++){
				this.triggerEvent(e[i], args);
			}
			
			this.checkQueue(event);

			return this;
		},

		fireAndCache : function(event){
			var args = $A(arguments);
			args.shift();

			this.cache[event] = args;

			return this.fire.apply(this, arguments);
		}
	});
})(stc);