var languages = {en:'en', fr:'fr', de:'de'};

module.exports = function(req, res, next){
	req.language = 'en';
	for(var n in req.cookies){
		switch(n){
			case 'language':
				req.language = languages[req.cookies[n]] || 'en';
				break;
		}
	}

	// set cookies based off of query strings
	for(var n in req.query || {}){
		switch(n){
			case 'language':
				req.language = languages[req.query[n]] || 'en';
				res.cookie('language', req.language, {expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365)});

				break;
		}
	}

	next();
};