var step = require('step'),
       $ = require('languageHelpers'),
  params = {
	table       : {type : 'string', required : true},
	pk_id       : {type : 'int'   , required : true},
	group_field : {type : 'string'},
	group_id    : {type : 'int'}
};

module.exports = function(p){
	step(function(){
		var     group = p.sql.group(),
		   groupWhere = (p.data.group_field && p.data.group_id) && [p.data.group_field, p.data.group_id];

		group.add(p.sql.rawSQL('LOCK TABLES ' + p.data.table + ' WRITE'));

		// get the lft & rht nodes of the node to be deleted
		group.add(p.sql
			.select(p.sql.raw('@pk_lft:=lft, @pk_rht:=rht'))
			.from  (p.data.table)
			.where (['pk_id', p.data.pk_id]));

		// delete the node and everything in it
		group.add(p.sql
			.deleteFrom(p.data.table)
			.where     (['lft', 'BETWEEN', p.sql.raw('@pk_lft AND @pk_rht')], groupWhere)
		);

		// shift everything left
		group.add(
			p.sql.update(p.data.table).set({lft: p.sql.raw('lft-1-@pk_rht+@pk_lft')}).where(['lft', '>', p.sql.raw('@pk_lft')], groupWhere),
			p.sql.update(p.data.table).set({rht: p.sql.raw('rht-1-@pk_rht+@pk_lft')}).where(['rht', '>', p.sql.raw('@pk_lft')], groupWhere)
		);

		// unlock tables
		group.add(p.sql.rawSQL('UNLOCK TABLES'));

		group.run(this);
	}, function(err){
		if(err){ return p.error(err); }

		p.cb({});
	}, p.catchStepError);
};

module.exports.params       = params;
module.exports.denyExternal = true;