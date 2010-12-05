var step = require('step'),
  params = {
	restricted : true,

	field_id   : {type : 'int', required : true},
	name       : {type : 'string'},
	type       : {type : 'string'},
	json       : {type : 'string'}
};

module.exports = function(p){
	step(
		function(){
			// get the constructor for the type, if it's passed in
			if(p.data.type){
				p.sql
					.select('pk_id')
					.from  ('form_field_type')
					.where (['constructor', p.data.type])
					.run   (this);
			}else{
				this();
			}

		}, function(err, data){
			if(err){ return p.error(err); }

			var update = {};
			if(data){ update.fk_type_id = data[0].pk_id; }

			p.data.hasOwnProperty('name') && (update.field_name  = p.data.name);
			p.data.hasOwnProperty('json') && (update.json_config = p.data.json);

			p.sql
				.update('form_field')
				.set   (update)
				.where (['pk_id', p.data.field_id])
				.run   (this);

		}, function(err, data){
			if(err){ return p.error(err); }

			p.cb({});
		}, p.catchStepError
	);
};

module.exports.params = params;