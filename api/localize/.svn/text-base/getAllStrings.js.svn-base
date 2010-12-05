var step = require('step'),
  params = {
	restricted : true,

	language   : {type : 'string'}
};

module.exports = function(p){
	step(
		function(){
		 	var sql = p.sql
				.select('pk_id AS string_id', 'name', 'en', 'fr', 'de')
				.from  ('localized_strings')
				.run   (this);

		},function(err, data){
			if(err){ return p.error(err); }

			p.cb({strings:data});
		}
	);
};

module.exports.params = params;