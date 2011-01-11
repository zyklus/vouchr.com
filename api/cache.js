module.exports = {
	get : function(path){
		var path = path.replace(/\//g, '.').split('.'),
		    root = this;

		for(var i=0, l=path.length; i<l; i++){
			root = root[path[i]] || (root[path[i]] = {});
		}

		return root;
	},

	// TODO: this, along with a way to expire without adding an expires property to the actual object -- expires hash pointing to paths?
	set : function(path, value){
		var path = path.replace(/\//g, '.').split('.'),
		    root = this;

			for(var i=0, l=path.length; i<(l-1); i++){
				root = root[path[i]] || (root[path[i]] = {});
			}

			root[path[l-1]] = value;
	},

	delete : function(path){
		var path = path.replace(/\//g, '.').split('.'),
		    root = this;

		for(var i=0, l=path.length; i<(l-1); i++){
			root = root[path[i]] || {};
		}

		delete root[path[l-1]];
	}
};