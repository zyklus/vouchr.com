$(function(){
	var page   = {body : $(document.body)};
	var footer = {div : $('#footer'), content : $('#footer .deals')};
	footer.div.bind('mouseover', function(ev){
		footer.contentWidth = footer.content.width();
		page.width          = page.body.width();
	}).bind('mousemove', function(ev){
		var x = ev.pageX;
		footer.content.css({left : - (x/page.width) * (footer.contentWidth - page.width)});
	})

	$('#deals .next').bind('click', changeDeal.bind(null, 1));
	$('#deals .prev').bind('click', changeDeal.bind(null, -1));

	var deals = {deal : $('#deal'), container : $('#deals .deals'), deals : $('#deals .deal')}

	function changeDeal(offset){
		page.width   = page.body.width();
		deals.offset = deals.container.offset();

		// get active deal
		var next, deal = deals.deals.filter(':visible:eq(0)');

		if(offset >= 0){
			next = deal.next();
			if(!next.length){ next = deal.prev(); }

			var width = next.width();
			next.css({left : page.width - deals.offset.left}).show().animate({left : 0});
			deal.animate({left : -width - deals.offset.left}, function(){ deal.hide(); });
		}else{
			next = deal.prev();
			if(!next.length){ next = deal.next(); }

			var width = next.width();
			next.css({left : -width - deals.offset.left}).show().animate({left : 0});
			deal.animate({left : page.width - deals.offset.left}, function(){ deal.hide(); });
		}
	}
});