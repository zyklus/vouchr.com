var step = require('step'),
     api = require(__dirname + '/../'),
  errors = require(__dirname + '/../errors');

module.exports.params = {
	apis     : {type : 'json', required : true},
	external : {type : 'boolean'}
};

module.exports.steps = step.fn(function(){
	var    p = this.shared.p,
	    apis = p.data.apis,
	   group = this.group(),
	           capi, root;

	for(var i=0, l=apis.length; i<l; i++){
		root = api;
		capi = apis[i][0].split('/');

		// locate the API
		for(var j=0, m=capi.length; j<m; j++){
			root && (root = root[capi[j]]);
		}

		// if the API doesn't exist or is inaccessible, say so
		if(!root || (p.data.external && root.denyExternal)){
			group().bind(null, null, errors.invalid_api).defer();
			continue;
		}

		p.data.external && (apis[i][1].external = true);

		root(apis[i][1], group());
	}

}, function(err, resp){
	var p = this.shared.p;

	if(err){ return p.error(err); }
	var out = {data:resp}

	for(var i=0, l=resp.length; i<l; i++){
		var r = resp[i];

		if(r.clearAuthToken){ out.clearAuthToken = r.clearAuthToken; }
		if(r.auth_token)    { out.auth_token     = r.auth_token;     }

		if(r.__hide && p.data.external){
			for(var j=0, m=r.__hide.length; j<m; j++){
				delete r[r.__hide[j]];
			}
		}
		if(r.headers){
			out.headers || (out.headers = {});
			for(var n in r.headers){
				out.headers[n] = r.headers[n];
			}
		}
		
		delete r.clearAuthToken;
		delete r.auth_token;
		delete r.__hide;
		delete r.headers;
//		delete r.root;
//		delete r.recursive;
	}

	p.cb(out);
});