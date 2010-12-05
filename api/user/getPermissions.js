var step = require('step');


module.exports.params = {
	auth_token : {type : 'string', required : true}
};


module.exports.steps = step.fn(function(){
	var p = this.shared.p;

	var sql = p.sql
		.select   (p.sql.raw('distinct api.name, api.pk_id AS api_id'))
		.from     ('api_name api')
		.innerJoin('map_group_api  map'  , 'api.pk_id   = map.fk_api_id')
		.innerJoin('user_group     group', 'group.pk_id = map.fk_group_id')
		.innerJoin('map_user_group map2' , 'group.pk_id = map2.fk_group_id')
		.where    (['map2.fk_user_id', p.authToken.userID])
		.orderBy  ('api.name');

	sql.run      (this);

}, function(err, data){
	this.shared.p.cb({permissions : data, root : 'permissions'});
});