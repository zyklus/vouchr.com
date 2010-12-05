$.fn.inactiveText = function(inactiveClass, defaultValue){
	var a, b;
	this
		.addClass('inactive')
		.focus(a=function(){
			var $this = $(this);
			$this.hasClass(inactiveClass) && $this.valueIs(defaultValue).val('').end().valueIsNot(defaultValue).removeClass(inactiveClass);
		})
		.blur(b=function(){
			var $this = $(this);
			this.value || $this.addClass(inactiveClass).val(defaultValue);
		});
	this.each(a);
	this.each(b);

	this.setDefaultValue = function(d){
		this.each(a);
		defaultValue = d;
		this.each(b);
	};

	return this;
};