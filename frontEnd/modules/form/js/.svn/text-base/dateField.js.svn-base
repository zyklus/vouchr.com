(function(){
	var clsRoot = 'form-datefield';

	$.modules.provide('form.dateField', 'form/js/formItem.js', {
		extend  : 'form/js/formItem.js',
		clsRoot : clsRoot,

		init : function(conf){
			this._super(conf);
		},

		setWidth : function(w){
			this._super(w);
			this.elemWidth -= 2; // for the border, for now

			this.inputNode.css('width', this.elemWidth);
		},

		createRootNode : function(){
			this._super();

			this.element.append(
				this.inputNode = this.$('<input class="x" id="x-' + this.itemID + '" />', clsRoot).datepicker()
					.bind('change', this.bind('onChange'))
			);
		}
	});
})();