(function(){
	var clsRoot = 'form-button';

	$.modules.provide('form.button', 'form/js/formItem.js', {
		extend  : 'form/js/formItem.js',
		clsRoot : clsRoot,

		init   : function(conf){
			this._super(conf);

			this.btnText = this.title;
			this.title   = '';
			this.align   = 'right';
		},

		createRootNode : function(){
			this._super();

			this.element.append(this.inputNode = this.$('<button class="x">' + (this.btnText || '') + '</button>', clsRoot));

			if(this.action && this['on' + this.action]){
				this.inputNode.bind('click', this.bind('on' + this.action));
			}
		},

		onsubmit : function(ev){
			ev.preventDefault();
			this.form.submit();
		},

		// no need to validate buttons!
		validate : function(){ return true; }
	});
})();