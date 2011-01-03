function showDeals(deals, activeIx){
	var container = $('.deals'),
	     template = $('#deal').html(),
	 miniTemplate = $('#searchResult').html(),
	                node;

	for(var i=0, l=deals.length; i<l; i++){
		var d = deals[i];

		d.image       = '/images/vouchrs/%s.jpg'.sprintf(d.imgs[0]);
		d.savePercent = 100 * (1 - (d.price / d.oprice)) << 0;
		d.saveDollars = d.oprice - d.price;
		d.status      = (d.purchased >= d.rpurchase) ? 'The deal is on with ' + d.rpurchase + ' bought' : (d.rpurchase - d.purchased) + ' more needed to activate this deal';
		d.details     = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque dapibus tempor imperdiet. Curabitur tincidunt placerat ante eu tempor. Ut tempor lectus eget diam tempus quis ullamcorper dui lobortis. Aenean rutrum odio et nisl feugiat id scelerisque est luctus. Mauris id sem libero, ut laoreet turpis. Aliquam ligula magna, mollis id interdum ut, commodo non dui. Vestibulum tincidunt tellus a massa tempor egestas. Nulla rutrum rhoncus sem, et placerat libero vulputate sit amet. Integer consequat, arcu et hendrerit vestibulum, sapien mi auctor enim, sollicitudin convallis diam nulla a neque. Nunc molestie feugiat arcu, ut pellentesque mi ultrices venenatis. Suspendisse lacus neque, porta sit amet aliquet et, placerat ac velit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.<br /><br />Integer gravida mollis malesuada. Nulla porttitor mollis nibh. Vivamus euismod eleifend nulla eget sodales. Morbi sapien urna, vehicula a posuere ac, iaculis a turpis. Duis vestibulum velit vitae ligula iaculis vestibulum eget nec ipsum. Praesent elit dui, suscipit ac pulvinar quis, lacinia vel nulla. In vitae magna arcu, dictum placerat ligula. Praesent in arcu eget orci posuere elementum. Quisque sit amet mauris dui. Donec non nisi diam. Suspendisse ac nisi quam. Sed et diam magna. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus ut ultricies mi. Maecenas facilisis, turpis et feugiat fermentum, turpis libero pellentesque nulla, dignissim commodo massa diam et eros. Pellentesque porttitor egestas venenatis. Sed ut hendrerit ipsum. Proin in tristique metus.'

		d.node = $(template.interpolate(deals[i])).data('ix', i);
		d.timer = d.node.find('.timeRemaining');
		container.append(d.node);
	}
	updateTimers();
	
	addPositionClassNames(activeIx);

	function addPositionClassNames(ix){
		deals[ix].node.addClass('currentDeal');

		// reposition all of the deals
		for(var i=ix-1, c=0; c<4; c++, i--){
			(i < 0) && (i=deals.length-1);
			deals[i].node.addClass('prevDeal prev' + c);
		}
		for(var i=ix+1, c=0; c<4; c++, i++){
			(i == deals.length) && (i=0);
			deals[i].node.addClass('nextDeal next' + c);
		}
	}

	function updateTimers(){
		var time = Date.now();
		for(var i=0, l=deals.length; i<l; i++){
			var remaining = ((deals[i].expires - time) / 1000) << 0,
			            h = (remaining / 3600) << 0,
			            m = ((remaining / 60) % 60) << 0,
			            s = remaining % 60;
			deals[i].timer.html('%s hours<br />%s minutes<br />%s seconds'.sprintf(h, m, s));
		}
	}

	$('.details .more').bind('click', function(ev){
		var link = $(ev.target), more = link.hasClass('more');
		link.closest('.details').animate(more ? {width : 650, height: 500} : {width : 200, height : 150})
		link.toggleClass('more').toggleClass('less').text(more ? 'Fewer Details' : 'More Details');
	});

	var dealNodes = container.find('.deal');
	container.delegate('.deal', 'click', function(ev){
		var target = $(ev.target).closest('.deal'), ix = target.data('ix');
		dealNodes.removeClass('prev0 prev1 prev2 prev3 next0 next1 next2 next3 prevDeal nextDeal currentDeal');
		addPositionClassNames(ix);
	});
	
	$('#effectToggle').bind('click', function(){
		$('body').toggleClass('effectsOn');
	});

	function showNewDeal(div){
		div.removeClass('newDeal');
	}

	$('#fakeSearchResults').bind('click', function(){
		$('#deals').animate({opacity:0}, function(){
			var results = $('#deals .searchResults').empty().append('<div class="applyFilter">Apply A Fake Filter</div>');
			$('#deals .deals').hide();
			$('#deals').animate({opacity:1});
			for(var i=0; i<12; i++){
				var div = $(miniTemplate).addClass('newDeal deal' + i);
				results.append(div);
				setTimeout(showNewDeal.bind(null, div), i*75);
			}
		})
	});

	$('.applyFilter').live('click', function(){
		var deals = $('#deals .searchResults .miniDeal');
		for(var i=0, l=deals.length; i<l; i++){
			if(Math.random() > .5){ deals.eq(i).addClass('fadeOut'); }
		}
		setTimeout(function(){
			var deals = $('#deals .searchResults .miniDeal.fadeOut'),
			   needed = deals.length,
			  results = $('#deals .searchResults');

			deals.remove();
			deals = $('#deals .searchResults .miniDeal:not(.fadeOut)');

			var ix = 0;
			for(var i=0, l=deals.length; i<l; i++){
				deals.eq(i).removeClass('deal0 deal1 deal2 deal3 deal4 deal5 deal6 deal7 deal8 deal9 deal10 deal11').addClass('deal' + (ix++));
			}

			for(var i=0; i<needed; i++){
				var div = $(miniTemplate).addClass('newDeal deal' + (11-i));
				results.append(div);
				setTimeout(showNewDeal.bind(null, div), i*75);
			}
		}, 200);
	});

	setInterval(updateTimers, 1000);
}