var step = require('step');

module.exports.params = {
	restricted : true
};

module.exports.steps = step.fn(function(){
	this.shared.p.sql
		.select('pk_id AS group_id', 'name')
		.from  ('user_group')
		.run   (this);

}, function(err, groups){
	this.shared.p.cb({groups:groups, root:'groups', key:'group_id'});
});