var  step = require('step'),
      api = require(__dirname + '/../'),
        $ = require('languageHelpers'),
  counter = 0,
   params = {
	root     : {type : 'string', required: true},
	language : {type : 'string'},
	hideName : {type : 'boolean'},
	showId   : {type : 'boolean'}
},

steps = step.fn(function(){
	var cached = this.shared.p.cache.get('localize/nestedStrings')[this.shared.p.data.root];

	if(cached){
		this.shared.cached = true;
		this(null, cached);
	}else{
		// it's just easier to put straight SQL here
		this.shared.p.sql.rawSQL('SELECT ns.pk_id, ns.fk_string_id, ns.lft, ns.rht FROM nested_strings ns, (SELECT n.lft, n.rht FROM localized_strings l INNER JOIN nested_strings n ON l.pk_id=n.fk_string_id WHERE name=\'%s\' LIMIT 1) q WHERE ns.lft >= q.lft AND ns.rht <= q.rht ORDER BY ns.lft'.sprintf(this.shared.p.data.root.replace(/'/g, "\\'"))).run(this);
	}

// translate all the strings
}, function(err, _strs){
	if(!this.shared.cached){
		this.shared.p.cache.set('localize/nestedStrings/' + this.shared.p.data.root, _strs);
	}
	this.shared.strs = _strs;

	var rIDs = [];
	for(var i=0, l=_strs.length; i<l; i++){
		rIDs.push(_strs[i].fk_string_id);
	}

	rIDs.length
		? api.localize.getStrings({string_ids: rIDs.join(','), language: this.shared.p.data.language}, this)
		: this();

}, function(err, s){
	var flds = {}, shared = this.shared, i=0, l=shared.strs.length, strings = s.strings;

	var node = (function getNodeTree(){
		var node    = JSON.parse(JSON.stringify(shared.strs[i]));
		strings[i].name && (node.name = strings[i].name);
		node.string = strings[i++].string;

		// child nodes
		while(shared.strs[i] && (shared.strs[i].rht < node.rht)){
			(node.children || (node.children = []))
				.push(getNodeTree());
		}

		// wipe info that shouldn't be exposed
		delete node.lft;
		delete node.rht;
		delete node.fk_string_id;

		if(!shared.p.data.showId ){ delete node.pk_id; }
		if(shared.p.data.hideName){ delete node.name;  }

		return node;
	})();

	node.root      = 'children';
	node.recursive = true;

	shared.p.cb(node);
}
);

module.exports.steps  = steps;
module.exports.params = params;