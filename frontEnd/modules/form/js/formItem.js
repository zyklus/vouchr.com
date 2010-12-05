(function(){
	// clsRoot in the module definition would get overridden, so...
	var clsRoot = 'form-item';

	$.modules.provide('form/js/formItem.js', 'placeable', {
		extend  : 'placeable',
		clsRoot : clsRoot,

		init : function(conf){
			$.extend(this, {
				itemID: $.guid++
			}, conf);

			this.visible = true;
			this.form.editMode && (this.json_config = conf);

			if(this.field_name && this.form){
				this.form.register(this.field_name, this);
			}

			this._super();
		},

		createRootNode : function(){
			this.rootNode = this.$('<div class="x" />', clsRoot);
			if(this.cls){
				this.rootNode.addClass(this.cls);
			}

			if(!this.visible){ this.rootNode.hide(); }

			this.form.editMode && this.rootNode.data('obj', this);
			this.dependencies = this.dependencies ? [].concat(this.dependencies) : [];
			this.watchDependencies();

			if(this.dependencies.length){
				this.hide();
			}

			(this.titleNode = this.$('<label for="x-#{itemID}" class="label">#{title}</label>'.interpolate(this), clsRoot))
				&& (this.rootNode.append(this.titleNode));

			this.setTitle(this.title);

			this.rootNode.append(this.element = this.$('<div class="element" />', clsRoot));
			this.rootNode.append(this.$('<div class="clear" />', clsRoot));

			this.element.addClass(this.clsRoot + '-element');

			this.align && (this.element.css('text-align', this.align));
		},

		// set up observers on all of the dependant fields
		watchDependencies : function(){
			var fields = {};
	
			// collect all of the field names that we have to listen to
			for(var i=0, l=this.dependencies.length; i<l; i++){
				var obj = this.dependencies[i];
				for(var n in obj){
					if(!obj.hasOwnProperty(n)){ continue; }
	
					fields[n] = 1;
				}
			}

			for(var n in fields){
				if(!fields.hasOwnProperty(n)){ continue; }

				this.form.observe('set: ' + n.split('.')[0], this.bind('checkDependencies'));
			}
		},

		// a dependant field has changed, check to see if dependencies are now met
		checkDependencies : function(){
			var toShow = false;

			checkDep:for(var i=0, l=(this.dependencies || []).length; i<l; i++){
				var obj = this.dependencies[i];
				for(var n in obj){
					var path = n.split('.'), nm = path[0], val, ix=1;
					if(path.length > 1){
						val = ((this.form.fieldValues[nm] || {}).field || {}).selectedData;
						while(val && (ix<path.length)){
							val = val[path[ix++]];
						}
					}else{
						val = (this.form.fieldValues[nm] || {}).val;
					}

					if(obj[n]=='*'){
						if(!val){ continue checkDep; }
					}else if(obj[n].indexOf('!') == 0){
						if(val == obj[n].substr(1)){ continue checkDep; }
					}else{
						if(val != obj[n]){ continue checkDep; }
					}
				}

				toShow = true;
			}

			l || (toShow = true);

			this.setValue(toShow ? null : '')[toShow ? 'show' : 'hide']();

			return this;
		},

		getJsonConfig : function(){
			for(var n in this.json_config){
				if(' action autoHeight labelWidth contentWidth sourceApi displayField valueField root filterRoot sourceData filter dependencies hideLabel height flex dataParent defaultValue defaultField emptyText showEmpty singleValue defaultFV value required cls bindData hideSingleItems maxlength validateRx validation '.indexOf(' ' + n + ' ') < 0){
					delete this.json_config[n];
				}
			}

			return this.json_config;
		},

		setValue : function(val){
			this.inputNode && this.inputNode.val(val || '');
			this.onChange();

			return this;
		},

		setTitle : function(title){
			title
				? this.titleNode.show().text(title)
				: this.titleNode.hide().text('');

			this.hasTitle = !!title;

			return this;
		},

		setWidth : function(w){
			this.width     = w;
			var cWidth     = this.getAttribute('contentWidth');
			if(cWidth && (this.parentElement.className != 'form.composite')){
				this.elemWidth = cWidth;
			}else{
				this.elemWidth = w - ((this.parentElement && (this.parentElement.className=='form.composite')) ? 0 : (parseInt(this.element.css('padding-left')) || 0)) 
					- (parseInt(this.element.css('margin-left' )) || 0) 
					- (parseInt(this.element.css('margin-right')) || 0);
			}

			if(this.inputNode){
				for(var n in {'padding-left':1, 'padding-right':1/*, 'border-left':1, 'border-right':1*/}){
					this.elemWidth -= (parseInt(this.inputNode.css(n)) || 0);
				}
			}

			return this;
		},

		renderTo : function(node){
			this._super.apply(this, arguments);

			if(this.inputNode){
				this.rootNode.append(this.$('<div class="invalid-icon" />', clsRoot));
			}

			var lW = this.hasTitle ? this.getAttribute('labelWidth') : 0;
			lW && this.titleNode.css('width', lW);
			lW += parseInt(this.titleNode.css('padding-right')) || 0;
			this.element.css('padding-left', (lW || 0));
		},

		getValue : function(){
			return this.inputNode ? this.inputNode.val() : '';
		},

		onChange : function(){
			var val = this.getValue();

			this.fire('change', val);

			if(!this.field_name){ return; }

			this.form.fire('set', this.field_name, val, this);
		},

		show : function(){
			if(this.visible){ return this; }

			this.visible = true;
			this.rootNode && this.rootNode.slideDown().fadeIn().dequeue();
			this.setValue(null);
			this.fire('show');

			return this;
		},

		hide : function(){
			if(this.form.editMode || !this.visible){ return this; }

			this.setValue && this.setValue('');

			this.visible = false;
			this.rootNode && this.rootNode[this.form.rendered ? 'slideUp' : 'hide']();
			this.fire('hide');

			return this;
		},

		validate : function(onlyTrue, fail){
			if(!this.rootNode){ return; }

			var v = !fail && ((this.required === false) || !this.visible || !this.inputNode || this.inputNode.val());
			if(onlyTrue && !v){ return false; }

			this.rootNode[v ? 'removeClass' : 'addClass']('invalid');

			return !!v;
		}
	});
})();