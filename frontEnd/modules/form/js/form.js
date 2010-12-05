(function(){
	var clsRoot = 'form';

	/* Creates a form for events, initializes all of the nested elements */
	$.modules.provide('form', [
		'jquery-ui',
		'placeable',
		'form/js/formItem.js',
		'form/js/fieldset.js',
		'form/js/textarea.js',
		'form/js/textfield.js',
		'form/js/combo.js',
		'form/js/dateField.js',
		'form/js/composite.js',
		'form/js/displayField.js',
		'form/js/data_controller.js',
		'form/js/button.js',
		'form/js/productImage.js'
	], {
		extend  : 'placeable',
		clsRoot : clsRoot,

		init : function(conf){
			this._super();

			$.extend(this, {
				elements : {}
			},
			conf);

			delete this.children;
			delete this.json_config;

			this.config = conf.children[0];

			this.observe('set', this.bind('onSetField'));

			this.fieldValues = {}

			this.config.json_config && $.extend(this, (new Function('return ' + this.config.json_config))());
			window.theForm = this;

			return this;
		},

		createRootNode : function(){
			this.rootNode = this.$('<form class="x ' + Math.random() + '" />', clsRoot);

			this.editMode
				&& this.rootNode.addClass('editMode')
				&& this.rootNode.data('obj', this);
		},

		onSetField : function(){
			var args = $A(arguments), field = args[0];

			this.fieldValues[field] = {val: args[1], field: args[2]};

			args[0] = 'set: ' + args[0];
			this.fire.apply(this, args);
		},

		renderTo : function(cont){
			this._super(cont);

			var children = this.config.children;
			for(var i=0, l=children.length; i<l; i++){
				this.createElements(this.config.children[i], this);
			}
			this.rendered = true;

			this.setWidth(this.width);
		},

		createElement : function(constructor, params){
			var rVal;

			// these should all be linear since all the modules are pre-loaded.  This may need to change in the future
			$.modules.load(constructor, params, function(obj){
				rVal = obj;
			});

			return rVal;
		},

		createElements : function(node, parent){
			var    obj = node.json_config ? eval('(' + node.json_config + ')') : {},
			  children = node.children || [];

			// remove children config, they don't need to be passed around everywhere
			delete obj.children;

			obj.title      = node.name || '';
			obj.form       = this;
			obj.field_name = node.field_name;

			node.field_id && (obj.field_id = node.field_id);

			var node = this.createElement(node.constructor, obj);
			parent.append(node);

			for(var i=0, l=children.length; i<l; i++){
				this.createElements(children[i], node);
			}

			return node;
		},

		register : function(name, field){
			this.elements[name] = field;

			return this;
		},

		validate : function(){
			var rVal = true;
			for(var i=0, l=this.children.length; i<l; i++){
				if(!this.children[i].validate()){ rVal = false; }
			}
			return rVal;
		},

		submit : function(){
			if(!this.validate()){
				alert('Please fill in all required fields');
				return;
			}

			var data = {form_id : this.form_id}, self = this;
			$.api.cookies.language && (data.language = $.api.cookies.language);

			for(var n in this.fieldValues){
				if(this.fieldValues[n].val){
					data[n] = this.fieldValues[n].val;
				}
			}

			$.post(this.post, data, function(resp){
				if(resp.status == 'success'){
					window.location = self.post;
				}
			});
		}
	});
})();