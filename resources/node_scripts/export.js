var api = require('./../../api');
api.sql
	.select('json_data')
	.from  ('submitted_form_data')
	.where (['json_data', 'like', '%language":"de%'])
	.where (['pk_id', '>', 400])
	.run   (function(err, data){
		for(var i=0, l=data.length; i<l; i++){
			var json = JSON.parse(data[i].json_data);
			for(var n in json){
				console.log(n + ': ' + json[n]);
			}
			console.log('\n\n---------------------\n\n');
		}
	});
