(function(){
	var foo;
	$.extend($.fn, {
		valueIs : (foo = function(not){
			return function(val){
				return this.pushStack(this.filter(function(){
					return not ^ ($(this).val() == val) ;
				}), 'valueIs' + (not ? 'Not' : ''), val);
			}
		})(),

		valueIsNot : foo(true)
	})
})();