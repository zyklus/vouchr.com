(function(){
	var clsRoot = 'form-display';

	$.modules.provide('form.displayField', 'form/js/formItem.js', {
		extend  : 'form/js/formItem.js',
		clsRoot : clsRoot,

		init : function(conf){
			this._super(conf);

			if(this.value){
				this._value = this.value;
				this.value  = '';
			}

			if(this.sourceApi){
				this.hide();
				$.modules.load('form.dataController', conf, this.bind('createdController'));
			}
		},

		createdController : function(cont){
			this.controller = cont
				.observe(['load', 'change'], this.bind('setVal'))
				.observe('empty', this.bind('hide'));

			this.checkDependencies();
		},

		setValue : function(val){
			if(!this.displayNode || (val===null) || (val=='') || ((val || (val = '')) == this.value)){ return this; }

			var  self = this,
			  visible = this.visible,
			   setVal = function(){
				self.displayNode.html(val)[visible ? 'fadeIn' : 'show']();
			}

			this.value = val;

			this.displayNode.text() ? this.displayNode[visible ? 'fadeOut' : 'hide'](visible ? 200 : 0, setVal) : setVal();

			this.onChange();
			return this;
		},

		getValue : function(){
			return this.value;
		},

		setVal : function(){
			var val = this.controller.getKeyValues();

			if((val && val[1] && (val = val[1].value)) === undefined){ return; }

			return this.setValue(val);
		},

		createRootNode : function(){
			this._super();

//			this.visible || this.hide();
			this.element.append(this.displayNode = this.$('<div class="x" />', clsRoot));

			if(this._value) this.setValue(this._value || '');

			return this;
		}
	});
})();