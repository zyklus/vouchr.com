/* This is basically just a passthrough to preorderTree/move */

var step = require('step'),
     api = require(__dirname + '/../../'),
  params = {
	restricted      : true,

	field_id        : {type : 'int', required : true},
	parent_id       : {type : 'int'},
	next_sibling_id : {type : 'int'}
};

module.exports = function(p){
	step(
		function(){
			p.sql
				.select('fk_form_id')
				.from  ('form_field')
				.where (['pk_id', p.data.field_id])
				.run   (this);

		}, function(err, data){
			if(err){ return p.error(err); }

			api.preorderTree.move({
				table           : 'form_field',
				pk_id           : p.data.field_id,
				parent_id       : p.data.parent_id,
				next_sibling_id : p.data.next_sibling_id,
				group_field     : 'fk_form_id',
				group_id        : data[0].id
			}, this);
		}, function(err, data){
			if(err){ return p.error(err); }

			p.cb({});
		}, p.catchStepError
	);
};

module.exports.params = params;