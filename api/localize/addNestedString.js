var step = require('step'),
     api = require(__dirname + '/../'),
  params = {
	restricted      : true,

	parent_id       : {type : 'int'},
	next_sibling_id : {type : 'int'}
};

module.exports = function(p){
	if(!p.data.parent_id && !p.data.next_sibling_id){
		throw new Error('parent_id or next_sibling_id required');
	}

	var nest_id, string_id;

	step(function(){
		// add a blank string
		api.localize.addString({}, this);

	}, function(err, data){
		if(err){ return p.error(err); }

		string_id = data.string_id;

		// insert string into nested_strings table
		p.sql
			.insertInto('nested_strings')
			.fields    ({fk_string_id : data.string_id})
			.run       (this);

	}, function(err, data){
		if(err){ return p.error(err); }

		api.preorderTree.move({
			table           : 'nested_strings',
			pk_id           : (nest_id = data.INSERT_ID),
			parent_id       : p.data.parent_id,
			next_sibling_id : p.data.next_sibling_id
		}, this);

	}, function(err, data){
		if(err){ return p.error(err); }

		p.cache.delete('localize/nestedStrings');
		p.cb({pk_id: nest_id, string:{pk_id: string_id}});

	}, p.catchStepError);
};

module.exports.params = params;