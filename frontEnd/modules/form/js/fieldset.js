(function(){
	var clsRoot = 'form-fieldset';

	$.modules.provide('form.fieldset', 'placeable', {
		extend  : 'placeable',
		clsRoot : clsRoot,

		init    : function(conf){
			this._super();

			$.extend(this, {
				title   : '',
				visible : !!conf.form.editMode
			}, conf);

			this.form.editMode && (this.json_config = conf);
		},

		createRootNode : function(){
			this.rootNode    = this.$('<div class="x"></div>', clsRoot);
			this.rootNode.append(
				this.titleNode = this.$('<div class="title"><div class="title-left" /><div class="title-right" />#{title}</div>'.interpolate(this), clsRoot), 
				this.element   = this.$('<div class="content" />', clsRoot)
			);

			if(!this.visible){ this.titleNode.hide(); }

			this.form.editMode && this.rootNode.data('obj', this);
		},

		getJsonConfig : function(){
			for(var n in this.json_config){
				if(' action autoHeight labelWidth contentWidth sourceApi displayField valueField root filterRoot sourceData filter dependencies hideLabel height flex dataParent defaultValue emptyText showEmpty singleValue '.indexOf(' ' + n + ' ') < 0){
					delete this.json_config[n];
				}
			}

			return this.json_config;
		},

		append : function(node){
			this._super.apply(this, arguments);

			node.observe(['show', 'hide'], this.bind('checkVisibility'));
			this.checkVisibility();
		},

		checkVisibility : function(){
			for(var i=0, c=this.children, l=c.length; i<l; i++){
				if(c[i].visible){
					if(!this.visible){
						this.visible = true;
						this.titleNode && this.titleNode.slideDown();
					}
					return;
				}
			}

			if(this.form.editMode){ return; }

			if(this.visible){
				this.visible = false;
				this.titleNode && this.titleNode.slideUp();
			}
		},

		validate : function(){
			var rVal = true;
			for(var i=0, l=this.children.length; i<l; i++){
				if(!this.children[i].validate()){ rVal = false; }
			}
			return rVal;
		}
	});
})();