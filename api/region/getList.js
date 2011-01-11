var step = require('step');

module.exports.params = {};

module.exports.steps = step.fn(function(){
	this.shared.p.sql
		.select('pk_id AS region_id', 'name')
		.from  ('region')
		.run   (this);

}, function(err, regions){
	this.shared.p.cb({regions:regions});
});