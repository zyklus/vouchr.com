var step = require('step'),
  params = {};

module.exports = function(p){
	var ip_parts = p.req.remoteAddress.split('.'), ip = 0;
	for(var i=0; i<4; i++){
		ip += parseInt(ip_parts[i]) << (8 * (3-i));
	}

	p.sql
		.select('country_code')
		.from  ('ip_range')
		.where (['start', '<=', ip], ['end', '>=', ip])
		.run   (function(err, data){
			if(err){ return p.error(err); }

			p.cb(data.length ? data[0] : {});
		});
};

module.exports.params = params;