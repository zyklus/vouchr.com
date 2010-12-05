// serves up a directory, parsing the view sub-directory as views

var express = require('express'),
       sass = require('sass'),
     static = express.staticProvider;

module.exports = function(path, opts){
	var fn, server = 
		express.createServer()
			.set('view options', {layout: false})
			.set('view engine', 'jade')
			.set('views'   , path + '/views')
			.set('partials', path + '/partials')
			.use(express.bodyDecoder());

	opts.preHandler && server.get('*', function(req, res, next){
		try{
			require(path + '/views/' + opts.preHandler)(req, res);
		}catch(err){
			next();
		}
	});

	// serve .sass files
	server.get('*.sass', function(req, res, next){
		res.render(path + req.params[0] + '.sass');
	})

	// serve up extension-less requests as views
	.get('*', fn = function(req, res, next){
		if(req.params[0].indexOf('.') >= 0){ return next(); }

		// try to actually load a module that matches the view name
		try{
			var mod = require(path + '/views' + req.params[0]);

			return mod(req, res, next);
		}catch(err){
			// TODO: this should do nothing if the module just didn't exist, but should throw an error if the module was there and error'd out
		}

		try{
			res.render(req.url.substr(1), {layout:false, locals:{req:req}}, function(err, resp){
				if(err){
					next();
				}else{
					res.send(resp);
				}
			});
		}catch(err){
			next();
		}
	})

	// views can handle posts too
	.post('*', fn)

	// deny direct access to views & partials
	.get('/view/*',     function(req, res, next){ res.send(404) })
	.get('/partials/*', function(req, res, next){ res.send(404) })

	// serve up everything else statically
	.use(static(path));

	return server;
};