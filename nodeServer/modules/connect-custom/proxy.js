var http = require('http');

module.exports = function(server){
	var res = /^([^:/]+)(?:(?::)([0-9]+))?/.exec(server),
	   host = res[1],
	   port = parseInt(res[2] || 80);

	return function(req, res) {
		req.headers.host = server;

		var    proxy = http.createClient(port, host),
		   proxy_req = proxy.request(req.method, req.url, req.headers);

		proxy_req.on('response', function (proxy_res) {
			proxy_res.on('data', function(chunk) {
				res.write(chunk, 'binary');
			});
			proxy_res.on('end', function() {
				res.end();
			});
			res.writeHead(proxy_res.statusCode, proxy_res.headers);
		});
		req.on('data', function(chunk) {
			proxy_req.write(chunk, 'binary');
		});
		req.on('end', function() {
			proxy_req.end();
		});

		proxy_req.end();
	}
}