var step = require('step'),
  params = {
	string_id   : {type : 'int'},
	string_name : {type : 'string'},
	language    : {type : 'string'}
};

function getString(strings, language){
	return {name:strings.name, string:strings[language] || strings['en'] || ''};
}

module.exports = function(p){
	if(!p.data.string_id && !p.data.string_name){
		return p.error('string_id or string_name is required');
	}

	var strings = p.cache.get('localize/strings');
	if(p.data.string_id   && strings[p.data.string_id  ]){ return p.cb(getString(strings[p.data.string_id  ], p.data.language)); }
	if(p.data.string_name && strings[p.data.string_name]){ return p.cb(getString(strings[p.data.string_name], p.data.language)); }

	step(
		function(){
		 	var res = p.sql
				.select('name', 'en', 'fr', 'de')
				.from  ('localized_strings')
				.where (p.data.string_id ? ['pk_id', p.data.string_id] : ['name', p.data.string_name])
				.run   (this);

		}, function(err, data){
			if(err){ return p.error(err); }

			if(data.length!=1){ return p.error(); }

			strings[p.data.string_id] = strings[data[0].name] = data[0];

			p.cb(getString(data[0], p.data.language));
		}, p.catchStepError
	);
};

module.exports.params = params;