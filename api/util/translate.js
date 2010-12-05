// http://www.google.com/uds/Gtranslate?q=Saint%20Vincent%20and%20the%20Grenadines&langpair=en|fr&v=1.0

var step = require('step'),
    http = require('http'),
  params = {
	string : {type : 'string'},
	from   : {type : 'string'},
	to     : {type : 'string'}
};

module.exports = function(p){
	var langs = p.data.to.split(',');

	step(function(){
		var self = this;

		for(var i=0, l=langs.length; i<l; i++){
			(function(){
				var     cb = self.parallel(),
				   client  = http.createClient(80, 'www.google.com')
				   request = client.request('GET', '/uds/Gtranslate?q=' + encodeURIComponent(p.data.string) + '&langpair=' + p.data.from + '|' + langs[i] + '&v=1.0', {'host': 'www.google.com'});

				request.end();
				request.on('response', function (response) {
					var data = '';
					response.on('data', function (chunk) {
						data += chunk;
					});
					response.on('end', function(){
						cb(null, data);
					});
				});
			})()
		}
	}, function(err, data){
		if(err){ return p.error(err); }

		var resp = [];

		for(var i=0, l=langs.length; i<l; i++){
			resp.push(eval('(' + arguments[i+1] + ')').responseData.translatedText);
		}

		p.cb({strings:resp});
	}, p.catchStepError);
};

module.exports.params = params;