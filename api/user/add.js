var hashlib = require('hashlib'),
       step = require('step'),
       salt = require(__dirname + '/../security/salt');


module.exports.params = {
	auth_token : {type : 'string'},
	first_name : {type : 'string'},
	last_name  : {type : 'string'},
	email      : {type : 'string', required   : true},
	region_id  : {type : 'int'   },
	password   : {type : 'string'},
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

	p.populate(fields, ['first_name', 'last_name', 'email']);
	if(p.data.region_id){ fields.fk_region_id = p.data.region_id; }

	p.sql
		.insertInto('user')
		.fields    (fields)
		.run       (this);


}, function(err, data){
	if(this.shared.p.data.password){
		this.shared.p.sql
			.update('user')
			.set   ({ password : hashlib.sha256(salt.sprintf(this.shared.p.data.password, data.INSERT_ID)) })
			.where (['pk_id', data.INSERT_ID])
			.run   (this);
	}else{
		this();
	}


}, function(){
	this.shared.p.cb({});
});