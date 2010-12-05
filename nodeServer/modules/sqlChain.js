var $ = require('languageHelpers'),

operations = {
	'INSERT' : ['INTO', 'FIELDS', 'SELECT'],
	'UPDATE' : ['UPDATE', 'SET', 'WHERE', 'ORDER', 'LIMIT'],
	'SELECT' : ['FIELDS', 'FROM', 'JOINS', 'WHERE', 'GROUP', 'HAVING', 'ORDER', 'LIMIT'],
	'DELETE' : ['DELETE', 'FROM', 'JOINS', 'WHERE', 'ORDER', 'LIMIT']
},

commands = {
	'INTO' : function(){
		return 'INTO ' + tickString(this._table.name);
	},
	'FIELDS' : function(){
		var op = (this._operation == 'SELECT') ? ' ' : '';
		return (op || '(') + getList(this._fields, 0).map(prepFieldNames) + (op || ')');
	},
	'SELECT' : function(){
		return this._select ? '(' + this._select.getSql() + ')' : 'VALUES (' + getList(this._fields, 1).map(escapeValue).join(', ') + ')';
	},
	'UPDATE' : function(){
		return tickString(this._table.name);
	},
	'SET' : function(){
		return 'SET ' + getSetters(this._fields).join(', ');
	},
	'WHERE' : function(){
		if(!this._where.length){ return ''; }

		return 'WHERE ' + joinOperands(this._where, getComparison);
	},
	'GROUP' : function(){
		if(!this._group.length){ return ''; }

		return 'GROUP BY ' + this._group.join(', ');
	},
	'HAVING' : function(){
		if(!this._having.length){ return ''; }

		return 'HAVING ' + joinOperands(_having.join(', '));
	},
	'ORDER' : function(){
		if(!this._order.length){ return ''; }

		return 'ORDER BY ' + this._order.join(', ');
	},
	'LIMIT' : function(){
		if(!this._limit){ return ''; }

		return 'LIMIT ' + this._limit.join(', ');
	},
	'FROM' : function(){
		return 'FROM ' + tickString(this._table.name) + (this._table.alias ? ' AS ' + tickString(this._table.alias): '');
	},
	'JOINS' : function(){
		if(!this._joins.length){ return ''; }

		var sql = [];
		for(var i=0, l=this._joins.length; i<l; i++){
			sql.push(this._joins[i].join + ' JOIN ' + tickString(this._joins[i].name) + (this._joins[i].alias ? ' AS ' + tickString(this._joins[i].alias) : '') + ' ON ' + joinOperands([].concat(this._joins[i].on), getComparison));
		}

		return sql.join(' ');
	},
	'DELETE' : function(){
		return this._joins.length ? tickString(this._table.name): '';
	}
};

function tickString(v){
	return v._raw ? v : '`' + v + '`';
}

function prepFieldNames(v){
	if(v._raw){ return v; }

	// breaks "foo.bar as llama" into "foo", "bar", "llama"
	var p = /(?:([^\.]+)(?=\.)\.)?([^ ]+)(?: +(?:AS +)?([^ ]+))?/i.exec(v)
	return (p[1] ? '`' + p[1] + '`.' : '') + '`' + p[2] + '`' + (p[3] ?' AS `' + p[3] + '`' : '');
}

function joinOperands(data, fn){
	var ary = [];
	for(var i=0, l=data.length; i<l; i++){
		if(data[i]._join){
			ary.push(joinOperands(data[i], fn));
		}else if(fn){
			ary.push(fn(data[i]));
		}else{
			ary.push(data[i]);
		}
	}

	return '(' + ary.join(data._join || ' AND ') + ')';
}

function getComparison(ary){
	if(!Array.isArray(ary)){ return ary; }

	var len = ary.length;
	if((len!=2) && (len!=3)){ throw new Error('Invalid Comparison'); }

	return ary[0] + ((len == 2) ? ' = ' : ' ' + ary[1] + ' ') + escapeValue(ary[len-1]);
}

function escapeValue(v){
	if(typeof(v) == 'undefined'){
		throw new Error('escape value is undefined');
	}

	return (v._join
		? joinOperands(v, escapeValue)
		: v._raw || (typeof(v) == 'number')
			? v
			: "'" + v.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'"
	);
}

function getList(obj, ix){
	if(ix > (Array.isArray(obj) ? 0 : 1)){
		throw new Error('Invalid field index');
	}

	if(Array.isArray(obj)){ return obj; }

	var vals = [];
	for(var key in obj){
		if(!obj.hasOwnProperty(key)){ continue; }
		vals.push(ix ? obj[key] : key);
	}

	return vals;
}

function getSetters(obj){
	if(obj.toString() != '[object Object]'){
		throw new Error('Object expected');
	}

	var out = [];
	for(var n in obj){
		if(!obj.hasOwnProperty(n)){ continue; }
		out.push(n + '=' + escapeValue(obj[n]));
	}

	return out;
}

function SQL(mySQL, maps, table, operation){
	this._mySQL     = mySQL;
	this._maps      = maps;

	this._table     = parseTable(table);
	this._operation = operation;
	this._fields    = [];
	this._joins     = [];
	this._where     = [];
	this._group     = [];
	this._order     = [];
	this._having    = [];

	this._where ._join =
	this._having._join = ' AND ';
}

SQL.prototype = {
	from : function(o){
		this._table = parseTable(o);

		return this;
	},

	// TODO: fix the insert getSQL() path so that it can accept arrays here
	fields : function(o){
		if($.isObject(o)){
			if(Array.isArray(this._fields)){ this._fields = {}; }
			for(var n in o){
				if(o[n] === undefined){ continue; }

				this._fields[n] = o[n];
			}
		}else{
			for(var i=0, l=arguments.length; i<l; i++){
				// TODO: reject undefined values
				this._fields.push(arguments[i]);
			}
		}

		return this;
	},
	where : function(){
		var data = [];
		for(var i=0, l=arguments.length; i<l; i++){
			if(!arguments[i]){ continue; }

			if(Array.isArray(arguments[i])){
				if(arguments[i].length){
					data.push(arguments[i]);
				}
			}else if((typeof(arguments[i]) == 'String') || arguments[i]._raw){
				data.push(arguments[i]);
			}else{
				for(var n in arguments[i]){
					data.push([n, arguments[i][n]]);
				}
			}
		}
		this._where = this._where.concat(data);

		return this;
	},
	groupBy : function(o){
		this._group = this._group.concat(Array.prototype.slice.call(arguments));

		return this;
	},
	orderBy : function(o){
		this._order = this._order.concat(Array.prototype.slice.call(arguments));

		return this;
	},
	having : function(o){
		this._having = this._having.concat(Array.prototype.slice.call(arguments));

		return this;
	},
	innerJoin : function(t, on){
		this._joins.push(parseTable(t, {join: 'INNER', on:on}));

		return this;
	},
	outerJoin : function(t, on){
		this._joins.push(parseTable(t, {join: 'OUTER', on:on}));

		return this
	},
	leftJoin : function(t, on){
		this._joins.push(parseTable(t, {join: 'LEFT', on:on}));

		return this;
	},
	rightJoin : function(t, on){
		this._joins.push(parseTable(t, {join: 'RIGHT', on:on}));

		return this;
	},
	joinTo : function(t){
		if(!this._maps){ throw new Error('No join rules defined'); }

		var tmp,
		    start = this._joins.length ? this._joins[this._joins.length - 1] : this._table,
		      end = parseTable(t),
		    order = (tmp = this._maps[start[0]]) && (tmp = tmp[end[0]])
		            ? tmp
		            : (tmp = this._maps[end[0]]) && (tmp = tmp[start[0]])
		                ? tmp.reverse()
		                : null;

		if(!order){ throw new Error('Impossible join'); }		
	},
	limit : function(a, b){
		this._limit = [a];
		b && this.limit.push(b);

		return this;
	},
	select : function(o){
		this._select = o;

		return this;
	},

	/**
	 * SQL operations
	 */

	getSql : function(){
		var sql = [this._operation],
		    ops = operations[this._operation];

		for(var i=0, l=ops.length; i<l; i++){
			sql.push(commands[ops[i]].apply(this));
		}

		return sql.join(' ').replace(/^ +| +(?= )| +$/g, '') + ';';
	},
	run : function(sql, cb){
		if(typeof(sql) == 'function'){
			cb  = sql;
			sql = undefined;
		}

		sql = sql || this.getSql();

		var query = this._mySQL.query(sql);
		query.on('success', sqlSuccess.bind(null, cb));
	}
};

// alias'
SQL.prototype.set = SQL.prototype.values = SQL.prototype.fields;

function sqlSuccess(cb, obj){
	cb && cb(null, obj);
}

function sqlError(cb, obj){
}

function parseTable(t, opts){
	if(t._raw){
		opts.name = t;
	}else{
		var parts = /^ *([^ ]+|\(.*?\))(?: +(?:AS +)?([^ ]+))? *$/i.exec(t);
		t = t.replace(/^ +| +(?= )| +$/g, '').split(' ');
		opts || (opts = {});

		if(parts){
			opts.name = parts[1];
			parts[2] && (opts.alias = parts[2]);
		}
	}

	if(opts.on && !opts.on._join){ opts.on._join = ' AND '; }

	return opts;
}

// TRANSACTIONS
function Group(mySQL, queries){
	this._mySQL   = mySQL;
	this._queries = queries;
}

Group.prototype = {
	add : function(){
		this._queries = this._queries.concat(Array.prototype.slice.call(arguments));
	},
	getSql : function(){
//		var query = ['START TRANSACTION;'];
		var query = [];
		for(var i=0, l=this._queries.length; i<l; i++){
			query.push(this._queries[i].getSql());
		}
//		query.push('COMMIT;');

		return query.join('');
	},
	run : SQL.prototype.run
};

// RAW SQL
function RawSQL(mySQL, sql){
	this._mySQL = mySQL;
	this._sql   = sql;
}

RawSQL.prototype = {
	getSql : function(){ return this._sql + (this._sql.substr(-1) == ';' ? '' : ';'); },
	run    : SQL.prototype.run
};

module.exports = function(mySQL, maps){
	return {
		insertInto : function(table){
			return new SQL(mySQL, maps, table, 'INSERT');
		},
		update : function(table){
			return new SQL(mySQL, maps, table, 'UPDATE');
		},
		select : function(fields){
			var s = new SQL(mySQL, maps, '', 'SELECT');

			return s.fields.apply(s, arguments);
		},
		selectFrom : function(table){
			return new SQL(mySQL, maps, table, 'SELECT');
		},
		deleteFrom : function(table){
			return new SQL(mySQL, maps, table, 'DELETE');
		},
		and : function(){
			var ary = Array.prototype.slice.call(arguments);
			ary._join = ' AND ';

			return ary;
		},
		or : function(){
			var ary = Array.prototype.slice.call(arguments);
			ary._join = ' OR ';

			return ary;
		},
		list : function(){
			var ary = Array.prototype.slice.call(arguments);
			ary._join = ', ';

			return ary;
		},
		raw : function(v){
			if(typeof(v) == 'string'){
				v = new String(v);
			}
			v._raw = true;

			return v;
		},
		group : function(){
			var queries = Array.prototype.slice.call(arguments);

			return new Group(mySQL, queries);
		},
		rawSQL : function(sql){
			return new RawSQL(mySQL, sql);
		}
	};
};