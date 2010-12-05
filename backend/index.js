/**
 * The purpose of this file is to capture HTTP requests, route them to
 * the correct API and respond with the data in whatever output format
 * was requested
 */

// TODO: handle POST responses as well as GET; allow a param to either stream or collect POST data

var    api = require(__dirname + '/../api'),
         $ = require('languageHelpers'),
  formData = require('connect-custom/form_data'),
   nullKey = 8907012380912378,
    nullRx = new RegExp(nullKey, 'g');

// handle the http request -- if we get here, we already know that the api call exists
function httpGetHandler(apiFn, req, res, next){
	var query = req.parsedURL.query || {};
	query.external = true;

	if(req.cookies && req.cookies.auth_token){
		query.auth_token = req.cookies.auth_token;
	}

	apiFn(query, apiResponse.bind(null, req, res, next), req, res, next);
}

// the API responds to this function -- actually do something now
function apiResponse(req, res, next, err, success){
	var query = req.parsedURL.query || {},
	   output = query.output || 'json',
	            cType, resp;

	// determine success or failure
	var apiResp = err
		? $.extend(err,     {status : 'failure'})
		: $.extend(success, {status : 'success'});

	// handle special-case api response params

	// set authToken cookie; still pass it on to the client
	if(apiResp.clearAuthToken){
		res.cookie('auth_token', '', {expires: new Date(1), path: '/', domain : /^(?:api\.)?([^/:]+)(?:[:/]|$)/.exec(req.headers.host)[1]});
	}else if(apiResp.auth_token){
		res.cookie('auth_token', apiResp.auth_token, {expires: new Date(apiResp.expires_at * 1000), path: '/', domain : /^(?:api\.)?([^/:]+)(?:[:/]|$)/.exec(req.headers.host)[1]});
	}

	// anything declared in 'hide' is for internal use only and is not to be exposed to the end client
	if(apiResp.__hide){
		for(var n in apiResp.__hide){
			delete apiResp[apiResp.__hide[n]];
		}
		delete apiResp.__hide;
	}

	// set response headers
	if(apiResp.headers){
		for(var n in apiResp.headers){
			if(!apiResp.headers.hasOwnProperty(n)){ continue; }

			res.headers[n] = apiResp.headers[n];
		}

		delete apiResp.headers;
	}

// TODO: this should respond to request headers as well as the 'output' query param
	switch(output){
		case 'text' :
			resp  = JSON.stringify(apiResp).replace(nullRx, '');
			break;

		case 'json' :
			cType = 'application/json';
			resp  = JSON.stringify(apiResp).replace(nullRx, '');

			break;

		case 'jsonp' :
			cType = 'text/javascript';
			resp  = (query.jsonp || '(function(){})') + '(' + JSON.stringify(apiResp).replace(nullRx, '') + ')';

			break;
	}
	// res.send(apiResp); return;

	cType && (res.headers['Content-Type'] = cType);
	res.send(resp);
};

// wrap every provided api in a get handler
(function traverse(apiNode, moduleNode){
	for(var n in apiNode){
		if($.isFunction(apiNode[n])){
			if(apiNode[n].denyExternal){ continue; }

			moduleNode[n] = httpGetHandler.bind(null, apiNode[n]);
		}else{
			traverse(apiNode[n], moduleNode[n] = {});
		}
	}
})(api, (module.exports = {GET:{}}).GET);
module.exports.POST = module.exports.GET;