var step = require('step'),
  params = {
	restricted : true,

	string_id  : {type : 'int'   , required : true},
	name       : {type : 'string'},
	en         : {type : 'string'},
	fr         : {type : 'string'},
	de         : {type : 'string'}
};

function getString(strings, language){
	return strings[language] || strings['en'] || '';
}

module.exports = function(p){
	var strings = p.cache.get('localize/strings');

	step(
		function(){
			var set = {};
			for(var n in p.data){
				if(n=='string_id'){ continue; }
				if(p.data[n] !== undefined){ set[n] = p.data[n]; }
			}

			sql = p.sql
				.update('localized_strings')
				.set   (set)
				.where (['pk_id', p.data.string_id])
				.run   (this);

		},function(err, data){
			if(err){ return p.error(err); }

			if(strings[p.data.string_id]){
				for(var n in p.data){
					if(n=='string_id'){ continue; }
					if(p.data[n] !== undefined){ strings[p.data.string_id][n] = p.data[n]; }
				}
			}

			p.cb({});
		}
	);
};

module.exports.params = params;