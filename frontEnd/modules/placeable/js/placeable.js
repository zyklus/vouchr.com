(function(){
	$.modules.provide('placeable', 'Observable', {
		extend  : 'Observable',

		after : {
			init : function(){
				this.createRootNode();
			},
			createRootNode : function(){
				this.element || (this.element = this.rootNode);
			},
			setWidth : function(){
				this.rootNode.width(this.width);

				this.fire('resize', this.elemWidth);
			}
		},

		init : function(){
			this._super();

			this.width = this.elemWidth = 0;
		},

		createRootNode : function(){
			if(!this.rootNode){
				this.rootNode = $('<div />');
			}
		},

		renderTo : function(node){
			$(node.element || node).append(this.rootNode);

			if(node.element){
				this.parentElement = node
					.observe('resize', this.bind('parentResize'));
			}else{
				var w;
				this.parentResize(w = this.getAvailableWidth(), w);
			};

			return this;
		},

		setWidth : function(w){
			this.width = this.elemWidth = w;
			this.elemWidth -=
				  (parseInt(this.element.css('padding-left' )) || 0)
				+ (parseInt(this.element.css('padding-right')) || 0);
		},

		parentResize : function(availWidth){
			this.setWidth(availWidth);		
		},

		append : function(node){
			(this.children || (this.children = [])).push(node);

			node.renderTo
				? node.renderTo(this)
				: this.element.append(node.rootNode || node);

			return this;
		},

		addClass : function(cls){
			this.rootNode.addClass(cls);

			return this;
		},

		removeClass : function(cls){
			this.rootNode.remoteClass(cls);

			return this;
		},

		getAttribute : function(nm){
			if(this[nm] != undefined){ return this[nm]; }

			if(this.parentElement && this.parentElement.getAttribute){ return this.parentElement.getAttribute(nm); }
		},

		// prefix all class names with this.clsRoot
		$ : function(nodeStr, cls){
			cls = cls + '-';
			return $(nodeStr.replace(/(class *= *")([^"]+)/g, function($0, $1, $2){ return $1 + cls + $2.replace(/^ +| +(?= )| +$/g, '').split(' ').join(' ' + cls); }));
		},

		getAvailableWidth : function(){
			if(this.parentElement && this.parentElement.width){
				return this.parentElement.width;
			}

			if(!this.rootNode.length || !this.rootNode[0].parentNode){
				return 0;
			}

			return $(this.rootNode[0].parentNode).width();
		}
	});
})();