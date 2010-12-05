var step = require('step'),
     api = require(__dirname + '/../../api'),
       $ = require('languageHelpers');


var steps = step.fn(function(){
	var token = (this.shared.req.cookies || {}).auth_token;

	// user wants to edit the form
	if(this.shared.req.query.edit){
		// see if the user has permission to edit the data
		api.user.hasPermissions({apis: '/form/field/add,/form/field/delete,/form/field/edit,/form/field/move', auth_token: token}, this);
	}else{
		this();
	}


}, function(err, perm){
	if(err && (err.code != 300)){ throw err; }

	var conf = $.extend({language: this.shared.req.language}, this.shared.req.query);

	// see if the user has permission to edit the data
	if(perm && perm.hasPermissions && !err){ conf.expose_form_ids = 1; }

	// get the form info
	api.form.get(conf, this.parallel());

	// get the empty placeholder text
	api.localize.getStrings({string_names: 'Empty Text,' + conf.form_name, language: this.shared.req.language}, this.parallel());

	// get the auto-detect country code
	api.localize.detectCountry({}, this.parallel());


}, function(err, form, s, cc){
	if(err){ throw err; }

	form.post      = '/submit_form';
	form.emptyText = s.strings[0].string;
	form.title     = s.strings[1].string;

	this.shared.res.send(this.shared.res.partial('form_view', {locals: {form: [form], req: this.shared.req, country_code: cc.country_code || 'US'}}));
});


module.exports = function(req, res, next){
	steps({shared:{req:req,res:res,next:next}});
}