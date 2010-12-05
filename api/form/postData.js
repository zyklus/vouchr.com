var step = require('step'),
    api  = require(__dirname + '/../'),
  params = {
	form_id : {type : 'int'   , required : true},
	data    : {type : 'string', required : true}
};

module.exports = function(p){
	var insert_id;

	step(function(){
		p.sql
			.insertInto('submitted_form_data')
			.fields    ({fk_form_id: p.data.form_id, json_data: p.data.data})
			.run       (this);

	}, function(err, resp){
		if(err){ return p.error(err); }

		insert_id = resp.INSERT_ID;

		// form is submitted and saved, return 'done' and then try to process it
		p.cb({});

		p.sql
			.select('json_data')
			.from  ('form')
			.where (['pk_id', p.data.form_id])
			.run   (this);

	}, function(err, resp){
		if(err){ return p.error(err); }

		if(!resp.length){ return; }

		var rootApi = api,
		       json = JSON.parse(resp[0].json_data || '{}');

		if(!json.handler){ return; }

		var path = json.handler.split('/');

		for(var i=0, l=path.length; i<l; i++){
			rootApi = rootApi[path[i]];

			if(!rootApi){ return; }
		}

		// if we get here, we have a pointer to the API call
		// fire it and go away
		rootApi({post_id: insert_id, data: p.data.data}, function(){});
	}, p.catchStepError);
};

module.exports.params = params;