/** LOGIC


				1	20
		2 11			12 17			18 19
		3 10		13 14	15 16
		4 9
	5 6		7 8

size  = 8
shift = 3
move 3-10 to in 13-14
- move 3-10 to -1003 to -1010
- update set left  = left-8  where left  between 11 and 13
- update set right = right-8 where right between 11 and 13
- move -1003 to -1010 to 6-13

			1	20
	2 3				4 17			18 19
				5 14	15 16
				6 13
				7 12
			8 9		10 11

size  = 8
shift = 7
move 3-10 before 18-19
- move 3-10 to -1003 to -1010
- update set left  = left-8  where left  between 11 and 17
- update set right = right-8 where right between 11 and 17
- move -1003 to -1010 to 10-17
*/

var step = require('step'),
  params = {
	table           : {type : 'string', required : true},
	pk_id           : {type : 'int'   , required : true},
	parent_id       : {type : 'int'},
	next_sibling_id : {type : 'int'},
	group_field     : {type : 'string'},
	group_id        : {type : 'int'}
};

module.exports = function(p){
	step(
		// get the existing nodes
		function(){
			p.sql
				.select('pk_id', 'lft', 'rht')
				.from  (p.data.table)
				.where (['pk_id', 'IN', p.sql.list(
					p.data.pk_id,
					p.data.parent_id       || 0,
					p.data.next_sibling_id || 0
				)])
				.run   (this);

		}, function(err, ids){
			if(err){ return p.error(err); }

			var parent, next, pk, next, target;

			for(var i=0, l=ids.length; i<l; i++){
				if(ids[i].pk_id == p.data.pk_id          ){ pk     = ids[i]; }
				if(ids[i].pk_id == p.data.parent_id      ){ parent = ids[i]; }
				if(ids[i].pk_id == p.data.next_sibling_id){ next   = ids[i]; }
			}

			target = next || parent;

			// validate that the parent/next node exists and is not a child of the node to be moved
			if(!target || ((target.lft >= pk.lft) && (target.lft <= pk.rht))){ return p.error('invalid_move'); }

			var    group = p.sql.group(),
			  groupWhere = (p.data.group_field && p.data.group_id) && [p.data.group_field, p.data.group_id],
			    nodeSize = ((pk.rht - pk.lft) || 1) + 1;

			// lock the table to prevent data from moving while this is going on
			group.add(p.sql.rawSQL('LOCK TABLES ' + p.data.table + ' WRITE'));

			// set sql variables
			group.add(p.sql
				.select(p.sql.raw('@pk_id:=pk_id, @pk_lft:=lft, @pk_rht:=rht, @nodeSize:=(CASE WHEN (rht-lft)=0 THEN 1 ELSE (rht-lft) END)+1'))
				.from  (p.data.table)
				.where (['pk_id', p.data.pk_id]));

			group.add(p.sql
				.select(p.sql.raw('@target_id:=pk_id, @target_lft:=lft, @target_rht:=rht'))
				.from  (p.data.table)
				.where (['pk_id', target.pk_id])
			);

			// remove the node from the tree if necessary
			if(pk.lft && pk.rht){
				group.add(
					p.sql.update(p.data.table).set({lft : p.sql.raw('-1000-lft'), rht : p.sql.raw('-1000-rht')}).where(['lft', 'BETWEEN', p.sql.raw('@pk_lft AND @pk_rht')], groupWhere),

					// fill in the hole that was created
					p.sql.update(p.data.table).set({lft : p.sql.raw('lft - @nodeSize')}).where(['lft', '>', p.sql.raw('@pk_rht')], groupWhere),
					p.sql.update(p.data.table).set({rht : p.sql.raw('rht - @nodeSize')}).where(['rht', '>', p.sql.raw('@pk_rht')], groupWhere)
				);

				(target.lft > pk.rht) && (target.lft -= nodeSize);
				(target.rht > pk.rht) && (target.rht -= nodeSize);

				(target.lft > pk.rht) && group.add(p.sql.rawSQL('SET @target_lft=@target_lft - @nodeSize'));
				(target.rht > pk.rht) && group.add(p.sql.rawSQL('SET @target_rht=@target_rht - @nodeSize'));
			}

			// if 'next', make the hole to the left of the target node, otherwise make it on the inside-right of the parent node
			var inPos = next ? '(@target_lft - 1)' : '(@target_rht - 1)';

			// create a hole large enough for the node to be moved into
			group.add(
				p.sql.update(p.data.table).set({rht : p.sql.raw('rht + @nodeSize')}).where(['rht', '>', p.sql.raw(inPos)], groupWhere),
				p.sql.update(p.data.table).set({lft : p.sql.raw('lft + @nodeSize')}).where(['lft', '>', p.sql.raw(inPos)], groupWhere)
			);

			next && (target.lft += nodeSize);
			target.rht += nodeSize;

			next && group.add(p.sql.rawSQL('SET @target_lft = @target_lft + @nodeSize'));
			group.add(p.sql.rawSQL('SET @target_rht = @target_rht + @nodeSize'));

			// the target position for the moved node
			var nPos = next ? target.lft - nodeSize : target.rht - nodeSize,
			   shift = nPos - pk.lft;

			group.add(
				p.sql.rawSQL('SET @shift = ' + (next ? '@target_lft - @nodeSize' : '@target_rht - @nodeSize') + ' - @pk_lft')
			);

			// move the node into the newly created hole
			group.add(
				(pk.lft && pk.rht)
					? p.sql
						.update(p.data.table)
						.set   ({lft : p.sql.raw('-lft-1000 + @shift'), rht : p.sql.raw('-rht-1000 + @shift + (CASE WHEN @pk_rht THEN 0 ELSE 1 END)')})
						.where (['lft', 'BETWEEN', p.sql.raw('(-1000 - @pk_rht) AND (-1000 - @pk_lft)')], groupWhere)
					: p.sql
						.update(p.data.table)
						.set   ({lft : p.sql.raw('lft + @shift'), rht: p.sql.raw('rht + @shift + (CASE WHEN @pk_rht THEN 0 ELSE 1 END)')})
						.where (['pk_id', p.sql.raw('@pk_id')])
			);

			// unlock tables
			group.add(p.sql.rawSQL('UNLOCK TABLES'));

//			console.log(group.getSql());
			group.run(this);
		}, function(err){
			if(err){ return p.error(err); }

			p.cb({});
		}, p.catchStepError
	);
};

module.exports.params       = params;
module.exports.denyExternal = true;