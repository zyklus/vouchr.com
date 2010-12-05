var step = require('step'),
     api = require('./../');


module.exports.params = {
	apis : {required : true}
};


module.exports.steps = step.fn(function(){
	var p = this.shared.p;

	if(!p.authToken){ return p.cb({ hasPermissions: false }); }

	api.user.getPermissions({ auth_token : p.authToken.token }, this)

}, function(err, p){
	var perms = ',' + this.shared.p.data.apis.toLowerCase() + ',';

	for(var i=0, l=p.permissions.length; i<l; i++){
		if((perms = perms.replace(',' + p.permissions[i].name.toLowerCase() + ',', ',')) == ','){ break; }
	}

	this.shared.p.cb({ hasPermissions: perms==',' });
});