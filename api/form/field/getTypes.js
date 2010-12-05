var step = require('step'),
  params = {};

module.exports = function(p){
	step(
		function(){
			var cached = p.cache.get('form');

			if(cached.fieldTypes){ return this(null, cached.fieldTypes); }

			p.sql
				.select('pk_id field_id', 'name', 'constructor')
				.from  ('form_field_type')
				.run   (this);

		},function(err, rows){
			if(err){ return p.error(err); }

			(p.cache.get('form').fieldTypes = rows);

			p.cb(rows);
		}, p.catchStepError
	);
};

module.exports.params = params;