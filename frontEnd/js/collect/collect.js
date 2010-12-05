$(function(){
	$('.continue').bind('click', function(ev){
		ev.preventDefault();

		var wWidth = $(window).width(),
		     $this = $(this),
		      sBar = $this.closest('.step'),
		    sWidth = sBar.width(),
		     sLeft = parseInt(sBar.css('left')),
		      sOff = sBar.offset(),
		     nStep = sBar.next('.step'),
		    orange = $('#orange'),
		    oWidth = orange.width();

		sBar.animate({left: -(sWidth + sOff.left - sLeft)}, function(){ sBar.hide(); });
		nStep.css({left: wWidth - sLeft}).show().animate({left: sLeft});
		orange.animate({width: oWidth + 139 + (oWidth>150 ? 29 : 0)});
	});
});