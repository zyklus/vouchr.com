var step = require('step'),
     api = require(__dirname + '/../');


step(function(){
	api.sql
		.select('name')
		.from  ('api_name')
		.run   (this);

}, function(err, apis){
	var eApis = {}, nApis = [], oApis = [];

	for(var i=0, l=apis.length; i<l; i++){
		eApis[apis[i].name] = 1;
	}

	(function parseApi(api, path){
		for(var n in api){
			if((n=='sql') || (n=='catchStepErrors')){ continue; }

			if(typeof(api[n]) != 'function'){
				parseApi(api[n], path + n + '/');
				continue;
			}

			if(eApis[path + n]){
				delete eApis[path + n];
				continue;
			}

			nApis.push(path + n);
		}
	})(api, '/');

	if(nApis.length){
		this.shared.nApis = nApis;
		api.sql.rawSQL('INSERT INTO api_name(name) VALUES(\'' + nApis.join("'), ('") + '\')').run(this);
	}

}, function(err, res){
	var nIds = [];
	for(var i=0, l=this.shared.nApis.length; i<l; i++){
		nIds.push(res.INSERT_ID + i);
	}

	api.sql.rawSQL('INSERT INTO map_group_api VALUES(1, ' + nIds.join('), (1, ') + ')').run(this);

}, function(err, res){
	
});