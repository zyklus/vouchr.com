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

	$('.moreDetails').bind('click', function(ev){
		var deal = $(ev.target).closest('.deal');
		deal.find('.right,.companyImage').animate({height:0,opacity:0}).end()
			.find('.details').show().css({opacity:0,top:300}).animate({top:50,opacity:1}).end()
			.find('.lessDetails').show().css({opacity:0,height:0}).animate({opacity:1, height:20});
	});

	$('.lessDetails').bind('click', function(ev){
		var deal = $(ev.target).closest('.deal');
		deal.find('.right,.companyImage').animate({height:310,opacity:1}).end()
			.find('.details').animate({top:300,opacity:0}, function(){ deal.find('.details').hide(); }).end()
			.find('.lessDetails').animate({opacity:0, height:0});		
	});
});