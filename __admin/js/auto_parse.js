(function(){
	var matches = {
		'.content ul li' : function(nodes){
			for(var i=nodes.length-1; i>=0; i--){
				$(nodes[i]).prepend('<div class="border"><div class="bg" /><div class="left" /><div class="right" /></div>');
			}
		}
	}

	parse();
	$.fn.domManip = $.fn.domManip.wrapWithProcessing(null, function(){
		parse(this);
		return this;
	});

	function parse(node){
		node = $(node || document.body);

		for(var n in matches){
			var m = matches[n];
			if(!m.id){ m.id = $.guid++; }

			/*
			if there is a chain of selectors, go up to the top one then filter down:
			.a .b .c = node.closest('.a').find('.b .c')
			*/
			if(n.indexOf(' ')){
				var chain  = n.split(' '),
				    parent = chain.shift(),
				    n      = chain.join(' '),
				    nodes  = node.parents(parent)
				                 .add(node.filter(parent))
				                 .findAll(n);
			}else{
				var nodes = node.findAll(n);
			}
			nodes = nodes.filter(':not(:data(auto_parse-' + m.id + '))');
			if(nodes.length>0){
				m(setProcessed(m.id, nodes));
			}
		}
	}

	function setProcessed(action, nodes){
		nodes.data('auto_parse-' + action, 1);
		return nodes;
	}
})();