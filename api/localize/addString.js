var step = require('step'),
  params = {
	restricted : true,

	en         : {type : 'string'},
	fr         : {type : 'string'},
	de         : {type : 'string'},
	name       : {type : 'string'}
};

module.exports = function(p){
	step(
		function(){
			p.sql
				.insertInto('localized_strings')
				.fields    (p.data)
				.run       (this);

		},function(err, rows){
			if(err){ return p.error(err); }

			p.cb({string_id : rows.INSERT_ID});
		}
	);
};

module.exports.params       = params;
module.exports.denyExternal = true;