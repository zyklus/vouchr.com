var step = require('step'),
     api = require(__dirname + '/../'),
  params = {
	restricted  : true,

	name        : {type : 'string', required : true},
	name_fr     : {type : 'string'},
	name_de     : {type : 'string'},
	json_config : {type : 'string'}
};

module.exports = function(p){
	var form;

	step(
		function(){
			// create the form
			p.sql
				.insertInto('form')
				.values({name : p.data.name})
				.run(this.parallel());

			// get the form_field_type id for the root FormPanel element
			p.sql
				.select('pk_id')
				.from  ('form_field_type')
				.where ({name : 'FormPanel'})
				.run   (this.parallel());

			// create a string for the FormPanel
			api.localize.addString({
				en : p.data.name,
				fr : p.data.name_fr,
				de : p.data.name_de
			}, this.parallel());

		// create the root form element
		}, function(err, _form, form_field, string){
			if(err){ return p.error(err); }
			form = _form;

			p.sql
				.insertInto('form_field')
				.fields    ({
					fk_form_id   : form.INSERT_ID,
					fk_type_id   : form_field[0].pk_id,
					fk_string_id : string.string_id,
					json_config  : p.data.json_config || '',
					lft          : 1,
					rht          : 2
				}).run(this);

		// just return the form id that we already have
		}, function(err, field){
			// TODO: delete stuff if an error
			if(err){ return p.error(err); }

			p.cb({form_id : form.INSERT_ID, root_field_id : field.INSERT_ID});
		}, p.catchStepError
	);
};

module.exports.params = params;