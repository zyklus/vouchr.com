require.paths.unshift(__dirname + '/../nodeServer/modules');

var       helpers = require('./helpers'),
           config = require('./../config'),
               db = config.database,
           errors = require('./errors'),
          readDir = require('readDir'),
         dbslayer = new (require('dbslayer').Server)(db.host, db.port),
         sqlChain = require('sqlChain'),
   validateParams = require('./validateParams'), // TODO: something with this file
                $ = require('languageHelpers'),
             step = require('step'),
          nullKey = 8907012380912378,
            cache = require('./cache');

/**
 * Configure the MySQL client
 */
var sql = module.exports.sql = sqlChain(dbslayer);


/**
 * Check to see if the parameters passed in are both valid and fulfilled
 */

var typeChecks = {
	int    : /^\d+$/,
	float  : /^\d+(\.\d+)?$/,
};

function catchStepErrors(p, err){
	if(err){ p.error(err); }
}

function errHandler(msg, shared){
	msg.message && (msg = msg.message);
	msg = errors[msg] || {code:0, msg:msg};

	((shared || {}).cb || this.cb || console.log)(msg, true);
}


var paramSteps = step.fn({
	errHandler : errHandler

}, function(params, fn, apiName, data, cb, req, res, next){
	this.shared.params  = params;
	this.shared.fn      = fn;
	this.shared.apiName = apiName;
	this.shared.data    = data;
	this.shared.cb      = cb;
	this.shared.req     = req;
	this.shared.res     = res;
	this.shared.next    = next;

	// Check to see if we have an auth token and need to validate it
	if((apiName != '/user/getAuthToken') && ((data.external && params.restricted) || data.auth_token || (params.auth_token && params.auth_token.required))){
		if(data.auth_token){
			validateAuthToken({shared : {cb : this.shared.cb}}, data.auth_token, !!params.restricted, this);
		}else{
			throw new Error('auth_token_missing');
		}
	}else{
		// if any restricted params are being used
		for(var p in params){
			if(data.external && params[p].restricted && (params[p].required || data[p])){
				throw new Error('auth_token_missing');
			}
		}

		this();
	}


}, function(err, authToken, permissions, expiresAt){
	if(err){ throw err; }

	if(permissions && !permissions[this.shared.apiName]){
		throw new Error('permission_denied');
	}

	// if we get here, the auth token is valid or not needed
	var outData = {},
              s = this.shared,
	              type;

	for(var p in s.params){
		if(!s.params.hasOwnProperty(p)){ continue; } // just in case some idiot touches Object.prototype

		type = s.params[p].type || 'string';

		if(typeChecks[type] && !typeChecks[type].test(s.data[p])){ s.data[p] = undefined; }

		// if we have a validation function to run
		if(validateParams[p]){ s.data[p] = validateParams[p](s.data[p]); }

		if(((s.data[p] === undefined) || (s.data[p] === '')) && s.params[p].required){ throw new Error(p + '_missing'); }

		outData[p] = s.data[p] ? (
			(type == 'int')   ? parseInt(s.data[p])                  :
			(type == 'float') ? parseFloat(s.data[p])                :
			(type == 'bool')  ? /^(true|1|yes|on)$/i.test(s.data[p]) :
			(type == 'date')  ? new Date(s.data[p] + ' GMT')         :
			(type == 'json')  ?
				$.isObject(s.data[p]) || Array.isArray(s.data[p]) ? s.data[p] : $.isString(s.data[p]) ? JSON.parse(s.data[p]) : ''
			: s.data[p]
		) : (s.data[p] == '') ? (
			((type == 'int') || (type == 'float')) ? 0               :
			(type == 'bool')                       ? false           :
			(type == 'date')                       ? new Date('---') :
			(type == 'json')                       ? {}              :
			''
		) : s.data[p];

		((type == 'int') || (type == 'float')) && isNaN(outData[p]) && (outData[p] = undefined);
	}

	// allow api calls that have no callback
	s.cb || (s.cb = function(){});

	var obj = {
		data     : outData,
		cb       : onAPIResponse.bind(null, s.cb, !!s.data.external, (authToken || {}).token, expiresAt),
		cache    : cache,

		getGuid  : helpers.getGuid,
		sql      : sql,
		populate : populate,
		config   : config,

		error    : errHandler,

		req      : {
			remoteAddress : s.req ? s.req.socket.remoteAddress : '127.0.0.1'
		},
		res      : s.res
	};

	// for sending the auth token to api calls
	if(authToken){
		obj.authToken = authToken;
	}

	// the step library changes scope, so we need to pass the object as the first param to the error handler
	obj.catchStepError = catchStepErrors.bind(null, obj);

	s.fn(obj);
});

function onAPIResponse(cb, external, authToken, expiresAt, apiResp, isErr){
	if(external){
		// This is for compressing the output of API responses
		// if a root element is specified, and the root is an array, break the objects down into nested arrays
		setChildren(apiResp, apiResp.root, !!apiResp.recursive);
	}
	if(authToken && expiresAt){
		apiResp.auth_token = authToken;
		apiResp.expires_at = expiresAt;
		(apiResp.__hide || (apiResp.__hide = [])).push('auth_token', 'expires_at');
	}

	cb(isErr ? apiResp : null, isErr ? null : apiResp);
}

function setChildren(root, key, recursive, keys){
	var oroot = root;
	if(root && (root = root[key]) && Array.isArray(root)){		
		// get a list of all keys
		if(!keys){
			keys = {};
			(function getKeys(root, key, recursive){
				for(var i=0, l=root.length; i<l; i++){
					for(var n in root[i]){
						if(!keys.hasOwnProperty(n)){ keys[n] = 1; }
						if(recursive && root[i][key]){ getKeys(root[i][key], key, true); }
					}
				}
			})(root, key, recursive);
			oroot.keys = keys = Object.getOwnPropertyNames(keys);
		}

		for(var i=0, l=root.length; i<l; i++){
			var record = [];
			for(var j=0, m=keys.length; j<m; j++){
				var val = root[i][keys[j]];
				if((val === undefined) || (val===null)){ val = nullKey; }
				record.push(val);
			};
			if(recursive && root[i][key]){ setChildren(root[i], key, recursive, keys); }
			root[i] = record;
		}
	}
}


var validateAuthToken = step.fn({
	errHandler : errHandler

},function(token, getPermissions, cb){
	this.shared.getPermissions = getPermissions;
	this.shared.retcb          = cb;

	sql
		.select('t.token', 't.expires_at', 't.fk_user_id')
		.from  ('token t')
		.where (['t.token', token])
		.run   (this);

}, function(err, data){
	if(err){ throw err; }

	var time = (Date.now() / 1000) >> 0;

	if(data.length && (data[0].expires_at >= time)){
		var expTime = this.shared.expTime = time + config.authToken.lifeInMinutes * 60;

		if(data[0].expires_at < expTime){
			sql
				.update('token')
				.set   ({expires_at : expTime})
				.where (['token', data[0].token])
				.run   ();

			data[0].expires_at = expTime;
		}
	}else{
		throw new Error('invalid_token');
	}

	this.shared.authToken = {
		token      : data[0].token,
		userID     : data[0].fk_user_id,
		expires_at : data[0].expires_at
	};

	if(this.shared.getPermissions){
		module.exports.user.getPermissions({ auth_token : this.shared.authToken.token }, this);
	}else{
		this();
	}

}, function(err, p){
	if(err){ throw err; }

	if(p){
		var permissions = {};
		for(var i=0, l=p.permissions.length; i<l; i++){
			permissions[p.permissions[i].name] = 1;
		}
	}

	this.shared.retcb(null, this.shared.authToken, permissions, this.shared.expTime);
});


function populate(hash, params){
	for(var i=0, l=params.length; i<l; i++){
		if(this.data[params[i]]){ hash[params[i]] = this.data[params[i]]+''; }
	}

	return this;
}


/**
 * Auto-load api from nested folders
 */
readDir(__dirname, true, function(apiName, mod){
	var verb, actions, action, eVerb, i, l,
	    path = apiName.split('/'),
	    root = module.exports;

	if(mod.steps){
		mod.fn = stepFn.bind(null, mod.steps);
	}else if($.isFunction(mod)){
		mod.fn = mod;
	}

	if(!$.isFunction(mod.fn) || !mod.params){ return; }

	// recursively make sure that the required export objects exist
	for(i=1, l=path.length-1; i<l; i++){
		root = root[path[i]] || (root[path[i]] = {});
	}

	root[path[l]] = paramSteps.bind(null, {}, mod.params, mod.fn, apiName)

	if(mod.denyExternal){ root[path[i]].denyExternal = true; }
});

function stepFn(steps, p){
	return steps({shared: {p:p}, errHandler : p.catchStepError});
}


module.exports.catchStepErrors = catchStepErrors;