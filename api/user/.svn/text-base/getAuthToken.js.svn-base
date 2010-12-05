var hashlib = require('hashlib'),
       step = require('step');


module.exports.params = {
	email     : {type : 'string', required : true},
	password  : {type : 'string', required : true},
	permanent : {type : 'bool'}
};


// see if the user account is valid
module.exports.steps = step.fn(function(){
	var where = {}, p = this.shared.p;
	p.populate(where, ['email']);

	p.sql
		.selectFrom('user')
		.fields    ('pk_id', 'password')
		.where     (where)
		.limit     (1)
		.run       (this);


}, function(err, _user){
	var p = this.shared.p;
	this.shared.user = _user[0];

	if(!_user.length || (this.shared.user.password != hashlib.sha256('n781%s91%s102d'.sprintf(this.shared.p.data.password, this.shared.user.pk_id)))){ throw new Error('invalid_credentials'); }


	// see if there is an existing token that hasn't yet expired
	var time = (Date.now() / 1000) >> 0;

	this.shared.ip      = p.req.remoteAddress;
	this.shared.expires = time + 60 * p.config.authToken[p.data.permanent ? 'permanentLifeInMinutes' : 'lifeInMinutes'];

	p.sql
		.select('token', 'expires_at')
		.from  ('token')
		.where (['fk_user_id', this.shared.user.pk_id], ['ip', this.shared.ip], ['expires_at', '>=', time])
		.run   (this);


}, function(err, token){
	var sql, p = this.shared.p;

	// update existing token
	if(token.length){
		this.shared.tokenID = token[0].token;

		sql = p.sql
			.update('token')
			.set   ({expires_at: this.shared.expires})
			.where ({token: token[0].token});

	}else{
		// create new token
		sql = p.sql
			.insertInto('token')
			.fields({
				token      : this.shared.tokenID = p.getGuid(),
				fk_user_id : this.shared.user.pk_id,
				ip         : this.shared.ip,
				expires_at : this.shared.expires
			});
	}

	// update or create the token and run callback when done
	sql.run(this);


}, function(err, newToken){
	this.shared.p.cb({
		auth_token : this.shared.tokenID,
		user_id    : this.shared.user.pk_id,
		expires_at : this.shared.expires,

		__hide     : ['user_id', 'expires_at', 'auth_token']
	});
});