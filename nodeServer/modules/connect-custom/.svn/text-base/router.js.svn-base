var     httpVerbs = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'TRACE'],
         parseURL = require('url').parse,
                $ = require('languageHelpers'),
     stripSlashes = /^\/+|(\/+)(?=\/)|\/$/g;

// execute a function or string handler, either linearly or in a callback
// The handler can deny the request by setting res.capture = false LINEARLY
function runHandler(req, res, next, handler, url){
	// bind the handler callback to it's own 'this' object
	res.cb = handlerCallback.bind({}, res);

	res.capture = true;

	try{
		var resp = (typeof(handler) == 'function')
			? handler(req, res, next)
			: handler;
	}catch(err){
		throw new Error('Error in router handler for: ' + url);
	}

	// function didn't return anything, wait for the callback
	if(resp === undefined){ return; }

	cb(resp);
}

/* Accepts :
 * - status  : HTTP Status Code
 * - headers : hash
 * - write   : content
 * - end     : content
 */
function handlerCallback(res, resp){
	// if just a response was returned, wrap it in an object
	if(typeof(resp) === 'boolean'){
		resp = {end : ''};
	}else if(typeof(resp) !== 'object'){
		resp = {end : resp.toString()};
	}

	// convert end or write into strings if necessary
	if(typeof(resp.write) === 'object'){ resp.write = JSON.stringify(resp.write); }
	if(typeof(resp.end  ) === 'object'){ resp.end   = JSON.stringify(resp.end  ); }

	// write out a header if one hasn't been written
	if(!this.exportedHeaders){
		res.writeHead(resp.status || 200, $.extend(
			{'Content-Type': 'text/plain'},

			// if the response body is included, give its length
			resp.end ? {
// TODO: unicode screws this up.  fix that.
//				'Content-Length' : resp.end.length + (resp.write || '').length
			} : {},

			// user-defined headers
			resp.headers || {}
		));

		this.exportedHeaders = true;
	}

	// write out mid-point request
	if(resp.write){
		res.write(resp.write);
	}

	// end the request
	if(typeof(resp.end) !== 'undefined'){
		res.end(resp.end);
	}
}

function parseVerbPaths(verb, obj, root){
	if(!verb || !obj){ return; }
	root || (root = '');

	verb.REGEXs || (verb.REGEXs = []);

	// parse the paths for any that require a regex
	parsePaths:for(var rx in obj){
		// recursively call parse on any sub-objects
		if(obj[rx].constructor === Object){
			var tmp = obj[rx]
			delete obj[rx]; // free, as a bird!
			parseVerbPaths(verb, tmp, root + '/' + rx + '/');
			continue;
		}
		if((obj[rx].constructor !== Function) && (obj[rx].constructor !== String)){
			continue;
		}

		// wasn't a sub-object, prepend the root string to the path and strip unnecessary slashes
		var path = (root + rx).replace(stripSlashes, '');

		// check to see if we need to turn the path into a regex (only done when necessary to save processing later on)
		if((path.indexOf(':') >= 0) || (path.indexOf('*') >= 0)){
			var paramRegEx = /([:\*]\w+)/g,
			    paramNames = [],

			// escape periods
			        regexp = '^' + path.replace(/\./g, '\\.') + '$';

			// store parameter names so that we can later pass them back appropriately
			while(param = paramRegEx.exec(path)){
				wildcard = param[0].substr(0, 1);
				param    = param[0].substr(1);

				// don't allow keyword parameters
				if(' href protocol host auth hostname port pathname search query hash capture '.indexOf(' ' + param + ' ')>=0){
					throw new Error('Invalid path parameter: "' + param + '"');

					continue parsePaths;
				}

				paramNames.push(param);
				switch(wildcard){
					case ':' :
						regexp = regexp.replace(':' + param, '([^\/]+)');
						break;
					case '*' :
						regexp = regexp.replace('*' + param, '(.*?)');
						break;
				} // switch
			} // while

			verb.REGEXs.push({
				regex      : new RegExp(regexp, 'i'),
				parameters : paramNames,
				handler    : obj[rx]
			});

			delete obj[rx];
		}else{ // not a regex
			// append the full path to the verb, even if we're just replacing it with itself
			verb[path] = obj[rx];
		}
	}
}


module.exports = function vhost(path){
	var module = require(path);

	if(!module){
		throw new Error('valid router module required');
	}

	// parse each verb for paths that need to be regex'd
	for(var verb, i=httpVerbs.length-1; i>=0; i--){

		// if the module doesn't provide anything for the verb
		if(!(verb = module[httpVerbs[i]])){ continue; }

		parseVerbPaths(verb, verb, '');
	}

	return function router(req, res, next){
		// route the request to the correct host / url mapper
		var method = req.method,
		       url = parseURL(req.url, true),
		             mapper, handlers, handler, resp;

		req.parsedURL = url;
		url.query && (req.params = url.query);

		url.pathname = url.pathname.substr(1);
		url.href     = url.href.substr(1);

		if((url.pathname == 'REGEXs') || !(handlers = module[method])){ 
			next();
			return;
		}
		handler = handlers[url.pathname];

		if(handler){
			runHandler(req, res, next, handler, url);
			if(res.capture){ return; }

		// test regex's
		}else{
			for(var i=0, l=handlers.REGEXs.length; i<l; i++){
				if(!handlers.REGEXs[i].regex.test(url.pathname)){ continue; }

				handler = handlers.REGEXs[i];
				var data = handler.regex.exec(url.pathname);
				for(var i=0, l=handler.parameters.length; i<l; i++){
					url[handler.parameters[i]] = data[i+1];
				}

				runHandler(req, res, next, handler.handler, url);
				if(res.capture){ return; }
			}
		}

		next();
	};
};