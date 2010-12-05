require.paths.unshift(__dirname + '/modules');

var  config = require(__dirname + '/../config'),
    express = require('express'),
      vhost = require('connect-custom/vhost'),
     router = require('connect-custom/router'),
      views = require('connect-custom/views'),
      proxy = require('connect-custom/proxy'),
     static = express.staticProvider,
	frontEnd,

     server = express.createServer()
		.use(express.logger())
		.use(express.conditionalGet())
		.use(express.cache())
		.use(express.gzip())
		.use(express.cookieDecoder())

		.use(vhost('api.vouchr.com', 'api.vouchr.local',
			express.createServer()
				.use(router(__dirname + '/../backend'))
				.use(static(__dirname + '/../xd'))
				.use(static(__dirname + '/../frontEnd/js'))

		))

		.use(vhost('vouchr.com', 'www.vouchr.com', 'vouchr.local',
			frontEnd = views(__dirname + '/../frontEnd', {
				preHandler : '__pre'
			})
		))

		.use(vhost('admin.vouchr.com', 'admin.vouchr.local',
			express.createServer()
				.use(function(req, res, next){
					if(req.url == '/'){ req.url = '/admin'; }
					next();
				})
				.use(frontEnd)
		))

		.use(vhost('dev.vouchr.com',
			proxy('vouchr.local')
		));

	server.configure('development', function(){
	    server.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	})
	.configure('production', function(){
	    server.use(express.errorHandler());
	});

server.listen(config.server.port);

process.on('uncaughtException',function(error){
	console.error('Uncaught Exception: ' + JSON.stringify(error));
})