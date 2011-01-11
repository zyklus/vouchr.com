$(function(){
	var aRegion, step = 1;
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

		if(step == 2){
			var email = sBar.find('input').val();
			if(!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)){
				$('#invalidEmail').fadeIn();
				return;
			}

			$.api.get('/user/add', {region_id: aRegion, email: email}, $.noop);
		}

		step++;
		sBar.animate({left: -(sWidth + sOff.left - sLeft)}, function(){ sBar.hide(); });
		nStep.css({left: wWidth - sLeft}).show().animate({left: sLeft});
		orange.animate({width: oWidth + 139 + (oWidth>150 ? 29 : 0)});
	});

	$('form').bind('submit', function(ev){
		ev.preventDefault();
		$('#step' + step + ' .continue').trigger('click');
	});

	var ul = $('#step1 ul'), sel = $('#step1 .selected'), cityText = $('#cityTxt span');
	$('#step1 .input').bind('click', function(){
		ul.slideToggle();
	});

	function setRegion(id){
		aRegion = id;

		var name = regions['id:' + id].name;
		sel.text(name);
		if(cityText.text()){
			cityText.fadeOut(function(){ cityText.text(name).fadeIn(); });
			ul.find('li').show();
		}else{
			cityText.text(name);
		}
		ul.find('li:data(id=' + id + ')').hide();
	}
	ul.delegate('li', 'click', function(){
		setRegion($(this).data('id'));
	});

	for(var i=0, l=regions.length; i<l; i++){
		ul.append($('<li>' + regions[i].name + '</li>').data('id', regions[i].region_id));
		regions['id:' + regions[i].region_id] = regions[i];
	}
	setRegion(region);
});