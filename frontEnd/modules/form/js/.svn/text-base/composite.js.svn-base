(function(){
	var clsRoot = 'form-composite';

	$.modules.provide('form.composite', 'form/js/formItem.js', {
		extend  : 'form/js/formItem.js',
		clsRoot : clsRoot,

		init   : function(conf){
			this._super(conf);
		},

		createRootNode : function(){
			this._super();

			this.addClass(clsRoot + '-x');
		},

		append : function(node){
			node.setTitle('');

			this._super(node);
		},

		after : {
			// just prevent the width from propagating automatically
			setWidth : $.noop
		},

		setWidth : function(w){
			this._super(w);

			for(var i=0, l=this.children.length, flex=0; i<l; i++){
				flex += this.children[i].flex || 1;
			}

			// keep track of the remaining width so that we can just set the last element to whatever is left
			var w = this.elemWidth, sW;
			for(var i=0, l=this.children.length; i<l; i++){
				i || this.children[i].addClass('first');
				this.children[i].setWidth(((i == l-1) ? w : sW = Math.round((this.children[i].flex || 1) / flex * this.elemWidth)) - (i && 5));
				w -= sW;
			}
		},

		validate : function(){
			if(!this.visible || (this.required === false)){ return true; }

			var rVal = true;
			for(var i=0, l=this.children.length; i<l; i++){
				if(!this.children[i].validate()){ rVal = false; }
			}
			return rVal;
		},

		parentResize : function(availWidth){
			this.setWidth(availWidth);
		},

		renderTo : function(node){
			this._super.apply(this, arguments);
		}
	});
})();