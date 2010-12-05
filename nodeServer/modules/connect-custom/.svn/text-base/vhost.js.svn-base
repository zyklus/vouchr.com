module.exports = function vhost(hosts, server){
	var hosts = Array.prototype.slice.call(arguments),
	   server = hosts.pop(),
	    hosts = ' ' + hosts.join(' ') + ' ';

	if(!hosts){
		throw new Error('vhost hostname required');
	}

	if(!server || (!server.handle && (typeof(server) != 'function'))){
		throw new Error('vhost server required');
	}

	return function vhost(req, res, next){
		var host = (req.headers.host || '').split(':')[0];
		if(hosts.indexOf(' ' + host + ' ') >= 0){
			// the ternary is because (server.handle || server)() loses the scope of server!!
			server.handle
				? server.handle(req, res, next)
				: server(req, res, next);
		}else{
			next();
		}
	};
};