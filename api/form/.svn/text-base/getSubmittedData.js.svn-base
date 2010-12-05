var step = require('step'),
  params = {
	bitmask    : {type : 'int'},
	negBitmask : {type : 'int'},
	formName   : {type : 'string', required : true}

}, steps = step.fn(function(){
	var p = this.shared.p;

	var sql = p.sql
		.select   ('sd.pk_id data_id', 'sd.json_data')
		.from     ('submitted_form_data sd')
		.innerJoin('form f', 'sd.fk_form_id=f.pk_id')
		.where    (['f.name', p.data.formName]);

	p.data.bitmask    && sql.where(p.sql.raw('(sd.bitmask & %s) = %s'.sprintf(p.data.bitmask || 0, p.data.bitmask || 0)));
	p.data.negBitmask && sql.where(p.sql.raw('(sd.bitmask & %s) = 0'.sprintf(p.data.negBitmask)));

	sql.run      (this);

}, function(err, data){
	this.shared.p.cb({data: data});
});

module.exports.steps        = steps;
module.exports.params       = params;
module.exports.denyExternal = true;