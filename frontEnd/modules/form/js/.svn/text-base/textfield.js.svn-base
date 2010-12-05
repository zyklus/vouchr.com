(function(){
	var clsRoot = 'form-textfield';

	$.modules.provide('form.textField', 'form/js/formItem.js', {
		extend  : 'form/js/formItem.js',
		clsRoot : clsRoot,

		init : function(conf){
			this._super(conf);
			switch(this.validation){
				case 'email':
					this.validateRx = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
					break;
			}
			this.validateRx && (this.validateRx = new RegExp(this.validateRx));
		},

		setWidth : function(w){
			this._super(w);
			this.elemWidth -= 2; // for the border, for now

			this.inputNode.css('width', this.elemWidth);
		},

		createRootNode : function(){
			this._super();

			this.element.append(
				this.inputNode = this.$('<input class="x" id="x-%s" maxlength="%s"/>'.sprintf(this.itemID, this.maxlength || 255), clsRoot)
					.bind('change', this.bind('onChange'))
					.bind('blur'  , this.bind('validate'))
			);
		},

		validate : function(){
			if(this.validateRx && !this.validateRx.test(this.inputNode.val())){
				return this._super(null, true);
			}

			return this._super();
		}
	});
})();