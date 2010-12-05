var hashlib = require('hashlib'),
       step = require('step');


module.exports.params = {
	auth_token : {type : 'string'},
	first_name : {type : 'string', required   : true},
	last_name  : {type : 'string', required   : true},
	email      : {type : 'string', required   : true},
	password   : {type : 'string', required   : true},
	activated  : {type : 'string', restricted : true}
};


module.exports.steps = step.fn(function(){
	var query = {}, p = this.shared.p;

	p.populate(query, ['email']);

	// see if there is already a user with this e-mail address
	p.sql
		.select ('email')
		.from   ('user')
		.where  (query)
		.run    (this);


}, function(err, data){
	var p = this.shared.p;

	if(data.length){ return p.error('email_taken'); }

	var fields = {};

	p.populate(fields, ['first_name', 'last_name', 'email', 'region']);

	p.sql
		.insertInto('User')
		.fields    (fields)
		.run       (this);


}, function(err, data){
	this.shared.p.sql
		.update('User')
		.set   ({ password : hashlib.sha256('n781%s91%s102d'.sprintf(this.shared.p.data.password, data.INSERT_ID)) })
		.where (['pk_id', data.INSERT_ID])
		.run   (this);


}, function(){
	this.shared.p.cb({});
});