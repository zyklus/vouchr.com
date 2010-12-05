var step = require('step'),
     api = require(__dirname + '/../'),
       $ = require('languageHelpers'),
  params = {
	form_id         : {type : 'int'},
	form_name       : {type : 'string'},
	language        : {type : 'string'},
	expose_form_ids : {type : 'string'}
};

module.exports = function(p){
	var form, fields;

	step(function(){
		if(!p.data.form_id && !p.data.form_name){ return p.error('form name required'); }

		var where = p.data.form_id
			? ['pk_id', p.data.form_id]
			: ['name', p.data.form_name];

		// get details on the form
		var sql = p.sql
			.select('pk_id AS form_id', 'json_data', 'name')
			.from  ('form')
			.where (where)
			.run   (this);

	}, function(err, _form){
		if(err){ return p.error(err); }
		if(!_form.length){ return p.error('invalid_form'); }

		// TODO: this function should be run in parallel if we alrady have the pk_id of the form from the params
		form = _form[0];

		// get the fields in the form
		p.sql
			.select    ('ff.pk_id AS field_id', 'ff.lft', 'ff.rht', 'ff.field_name', 'ff.json_config', 'ff.fk_string_id', 'fft.constructor')
			.from      ('form_field ff')
			.innerJoin ('form_field_type fft', 'ff.fk_type_id=fft.pk_id')
			.where     (['fk_form_id', form.form_id])
			.orderBy   ('lft')
			.run       (this);

	}, function(err, _fields){
		// get all of the localized strings
		if(err){ return p.error(err); }

		fields = _fields;

		var string_ids = [];
		for(var i=0, l=fields.length; i<l; i++){
			string_ids.push(fields[i].fk_string_id);
		}

		api.localize.getStrings({string_ids: string_ids.join(','), language:p.data.language}, this);

	}, function(err, s){
		// re-order the fields into a nested hash and apply the strings
		var flds = {}, i=0, l=fields.length, strings = s.strings;

		var node = $.extend(form, {children : [(function getNodeTree(){
			var node  = fields[i];
			node.name = strings[i++].string;

			// child nodes
			while(fields[i] && (fields[i].rht < node.rht)){
				(node.children || (node.children = []))
					.push(getNodeTree());
			}

			// wipe info that shouldn't be exposed
			if(!p.data.expose_form_ids){ delete node.field_id; }
			delete node.lft;
			delete node.rht;
			delete node.fk_string_id;

			return node;
		})()]});

		p.cb(node);

	}, p.catchStepError);
};

module.exports.params = params;