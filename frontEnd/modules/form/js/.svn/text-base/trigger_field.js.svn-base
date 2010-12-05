(function(){
	var clsRoot = 'form-trigger';

	$.modules.provide('form.triggerField', 'placeable', {
		extend  : 'placeable',
		clsRoot : clsRoot,

		init    : function(conf){
			this._super();

			$.extend(this, {
				title : ''
			}, conf);
		},

		createRootNode : function(){
			this.element.append(this.inputNode = this.$('<input class="x" />', clsRoot), this.triggerNode = this.$('<img class="x">'));
		}
	});
})()