(function(){
	var clsRoot = 'form-combo';

	$.modules.provide('form.combo', 'form/js/formItem.js', {
		extend  : 'form/js/formItem.js',
		clsRoot : clsRoot,

		init : function(conf){
			this._super(conf);
			this.hide();

			if(this.defaultFV && !this.defaultValue){
				this.defaultValue = this.form[this.defaultFV];
			}

			$.modules.load('form.dataController', conf, this.bind('createdController'));
		},

		createdController : function(cont){
			this.controller = cont
				.observe(['load', 'change'], this.bind('setOptions'))
				.observe('empty', this.bind('hide'));
		},

		setOptions : function(){
			if(!this.inputNode){ return; }

			var options = this.options = this.controller.getKeyValues(), dV = this.getDefaultValue();

			this.inputNode.empty();
			var sI = 0;
			for(var i=0, l=options.length; i<l; i++){
				this.inputNode.append($('<option value="%s">%s</option>'.sprintf(options[i].value, !i && !options[i].key ? this.getAttribute('emptyText') || '' : options[i].key)).data('ix', options[i].ix));
				if((options[i].value != '') && (options[i].value === (this.value || dV))){ sI = i; }
			}

			this.inputNode.attr('selectedIndex', sI);
			this.checkDependencies();

			if(dV && (this.getValue() == dV)){
				this.onChange();
			}

			this.changeValue();
		},

		changeValue : function(){
			this.value = this.inputNode.val();
			this.key   = this.inputNode.find(':selected').text();
		},

		setWidth : function(w){
			this._super(w);

			this.inputNode.css('width', this.elemWidth);

			return this;
		},

		setValue : function(val){
			val = val || ((val===null) && this.controller && this.getDefaultValue()) || '';

			if(this.inputNode){
				var opts = this.inputNode.find('option');
				for(var i=0, l=opts.length; i<l; i++){
					if(opts[i].value == val){
						this.inputNode.attr('selectedIndex', i);
						break;
					}
				}
			}
			this.onChange().validate(true);

			return this;
		},

		getDefaultValue : function(){
			if(this.defaultValue){ return this.defaultValue; }

			var dF = this.defaultField;
			if(!dF){ return undefined; }

			var path = dF.split('.'), nm = path[0], val, ix=1;
			if(path.length > 1){
				val = ((this.form.fieldValues[nm] || {}).field || {}).selectedData;
				while(val && (ix<path.length)){
					val = val[path[ix++]];
				}
			}else{
				val = (this.form.fieldValues[nm] || {}).val;
			}

			return val;
		},

		createRootNode : function(){
			this._super();

			this.visible || this.rootNode.hide();

			this.element.append(
				this.inputNode = this.$('<select class="x" id="x-' + this.itemID + '" />', clsRoot)
					.bind('change', this.bind('onChange'))
					.bind('change', this.bind('validate'))
					.bind('blur'  , this.bind('validate'))
			);
			this.inputNode.bind('change', this.bind('changeValue'));

			return this;
		},

		onChange : function(){
			if(!this.inputNode){ return this; }

			this.selectedData = this.controller.getDataAtIndex(this.inputNode.find('option:eq(' + this.inputNode.attr('selectedIndex') + ')').data('ix'));
			this._super();

			return this;
		},

		checkDependencies : function(){
			if(!this.options || !(this.options.length > (this.hideSingleItems ? 2 : 0))){
				if(this.options && (this.options.length > 1)){
					this.setValue(this.options[1].value);
				}
				this.hide();
				return this;
			}

			return this._super();
		}
	});
})();