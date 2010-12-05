var api = require(__dirname + '/../../api'),
   step = require('step'),
      $ = require('languageHelpers');

module.exports = function(req, res, next){
	switch(req.method){
		case 'GET':
			step(function(){
				api.localize.getStrings({string_names: 'Ticket thank you 1,Ticket thank you 2', language: req.language}, this);
			}, function(err, s){
				if(err){ throw err; }

				var strings = s.strings;

				res.send(res.partial('submit_ticket', {locals: {thankyou1 : strings[0].string, thankyou2 : strings[1].string, req: req}}));
			});

			break;
		case 'POST':
			var    data = req.body,
			    form_id = data.form_id;

			delete data.form_id;

			api.form.postData({
				form_id : parseInt(form_id),
				data    : JSON.stringify(data)
			}, function(err, data){
				if(err){ throw err; }
				res.contentType('foo.json');
				res.send('{"status":"success"}');
			})

			break;
	}
};