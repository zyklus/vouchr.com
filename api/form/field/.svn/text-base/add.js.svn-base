var step = require('step'),
     api = require(__dirname + '/../../'),
  params = {
	restricted      : true,

	form_id         : {type : 'int'   , required : true},
	field_type      : {type : 'string', required : true},
	name            : {type : 'string'},
	title           : {type : 'string'},
	title_fr        : {type : 'string'},
	title_de        : {type : 'string'},
	parent_id       : {type : 'int'},
	next_sibling_id : {type : 'int'},
	json_config     : {type : 'string'}
};

module.exports = function(p){
	var field;

	step(
		function(){
			// get the field type id
			p.sql
				.select('pk_id')
				.from  ('form_field_type')
				.where ({name : p.data.field_type})
				.run   (this.parallel());

				// add a localize string for the field name
				if(p.data.title){
					api.localize.addString({
						en : p.data.title,
						fr : p.data.title_fr,
						de : p.data.title_de
					}, this.parallel());
				}

		// add the field
		},function(err, field_type, string){
			if(err){ return p.error(err); }

			if(!field_type.length){ return p.error('invalid_field_type'); }

			var sql = p.sql
				.insertInto('form_field')
				.values({
					fk_form_id  : p.data.form_id,
					fk_type_id  : field_type[0].pk_id,
					field_name  : p.data.name,
					json_config : p.data.json_config
				});

			if(string){
				sql.values({fk_string_id : string.string_id});
			}

			sql.run(this.parallel());

			// get the top-level form element if there's no parent or sibling id set
			if(!p.data.parent_id && !p.data.next_sibling_id){
				p.sql
					.select('pk_id')
					.from  ('form_field')
					.where ({ fk_form_id : p.data.form_id, lft : 1 })
					.run   (this.parallel());
			}

		// move the field to the appropriate place (left/right nodes)
		},function(err, _field, root_form_field){
			if(err){ return p.error(err); }

			field = _field;

			api.preorderTree.move({
				table           : 'form_field',
				pk_id           : field.INSERT_ID,
				parent_id       : p.data.parent_id || (root_form_field || [{pk_id:0}])[0].pk_id,
				next_sibling_id : p.data.next_sibling_id,
				group_field     : 'fk_form_id',
				group_id        : p.data.form_id
			}, this);

		// just return the field that we already have
		}, function(err){
			if(err){ return p.error(err); }

			p.cb({field_id : field.INSERT_ID});
		}, p.catchStepError
	)
};

module.exports.params = params;