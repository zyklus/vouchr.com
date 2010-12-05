var api = require(__dirname + '/../../'),
   step = require('step'),
 params = {
	restricted : true,

	field_id   : {type : 'int', required : true},
};

module.exports = function(p){
	step(function(){
		p.sql
			.select('fk_form_id')
			.from  ('form_field')
			.where (['pk_id', p.data.field_id])
			.run   (this);

	}, function(err, field){
		if(err){ return p.error(err); }

		api.preorderTree.delete({
			table       : 'form_field',
			pk_id       : p.data.field_id,
			group_field : 'fk_form_id',
			group_id    : field[0].fk_form_id
		}, this);

	}, function(err){
		if(err){ return p.error(err); }

		p.cb({});
	}, p.catchStepError);
};

module.exports.params = params;