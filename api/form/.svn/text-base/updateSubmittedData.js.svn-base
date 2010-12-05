var step = require('step'),
  params = {
	data_id    : {type : 'int', required : true},
	bitmask    : {type : 'int'},
	negBitmask : {type : 'int'}

}, steps = step.fn(function(){
	var p = this.shared.p, bitmask = 'bitmask';

	p.data.bitmask    && (bitmask = '(%s | %s)' .sprintf(bitmask, p.data.bitmask));
	p.data.negBitmask && (bitmask = '(%s & ~%s)'.sprintf(bitmask, p.data.negBitmask));

	var sql = p.sql
		.update('submitted_form_data')
		.set   ({bitmask : p.sql.raw(bitmask)})
		.where (['pk_id', p.data.data_id])
		.run   (this);
}, function(){
	this.shared.p.cb({});
});

module.exports.steps        = steps;
module.exports.params       = params;
module.exports.denyExternal = true;