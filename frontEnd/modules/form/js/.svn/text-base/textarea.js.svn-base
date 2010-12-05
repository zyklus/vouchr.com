(function(){
	var clsRoot = 'form-textarea';

	$.modules.provide('form.textArea', 'form/js/formItem.js', {
		extend  : 'form/js/formItem.js',
		clsRoot : clsRoot,

		// init : function(conf){
		// 	this._super(conf);
		// },

		setWidth : function(w){
			this._super(w);

			this.element.css('width', w = (this.elemWidth - 2));
			this.element.resizable('option', 'minWidth', w);
			this.element.resizable('option', 'maxWidth', w);
		},

		createRootNode : function(){
			this._super();

			this.element.resizable({handles:'s,se', minHeight: 50});
			this.element.append(
				this.inputNode = this.$('<textarea class="x" id="x-' + this.itemID + '" />', clsRoot)
					.bind('change', this.bind('onChange'))
					.bind('blur'  , this.bind('validate'))
			);
			this.height && this.element.css('height', this.height);
		}
	});
})();