var step = require('step'),
  params = {
	string_ids   : {type : 'string'},
	string_names : {type : 'string'},
	language     : {type : 'string'}
};

function getString(strings, language){
	if(language=='all'){ return strings; }

	return strings[language] || strings['en'] || '';
}

module.exports = function(p){
	if(!p.data.string_ids && !p.data.string_names){
		return p.error('string_ids or string_names is required');
	}

	var strings = p.cache.get('localize/strings'),
	    needIds = [],
	    idQuery = (p.data.string_ids   ? p.data.string_ids  .split(',') : []).map(function(v){ return parseInt(v) || 0; }),
	    nmQuery = (p.data.string_names ? p.data.string_names.split(',') : []),
	    queries = idQuery.concat(nmQuery),
	              i, l;

	for(i=0, l=queries.length; i<l; i++){
		if(!queries[i]){ continue; }

		strings[queries[i]] || needIds.push(queries[i]);
	}

	if(!needIds.length){ return returnData(p, strings, queries); }

	step(
		function(){
		 	var sql = p.sql
				.select('pk_id', 'name', 'en', 'fr', 'de')
				.from  ('localized_strings')
				.where (p.sql.or(['pk_id', 'IN', p.sql.list.apply(p.sql, needIds)], ['name', 'IN', p.sql.list.apply(p.sql, needIds)]))
				.run   (this);

		}, function(err, data){
			if(err){ return p.error(err); }

			for(var i=0, l=data.length; i<l; i++){
				strings[data[i].pk_id] = strings[data[i].name]  = data[i];
			}

			returnData(p, strings, queries);
		}, p.catchStepError
	);
};

function returnData(p, strings, query){
	var out = [];

	for(var i=0, l=query.length; i<l; i++){
		if(!strings[query[i]]){
			out.push({});
			continue;
		}
		out.push({name: strings[query[i]].name, string: getString(strings[query[i]] || {}, p.data.language)});
	}

	p.cb({strings:out, root:"strings"});
}

module.exports.params = params;