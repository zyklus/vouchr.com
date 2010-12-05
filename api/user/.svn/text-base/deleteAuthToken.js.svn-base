var step = require('step');

module.exports = function(p){
	// immediately return.  No need to wait for the cookie to be deleted
	p.cb({clearAuthToken:true, __hide:['clearAuthToken']});

	if(p.authToken){
		p.sql
			.deleteFrom('token')
			.where     (['token', p.authToken.token])
			.run       ();
	}
};

module.exports.params = {};