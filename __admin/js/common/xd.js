(function(){
	// Set domain to top-level to facilitate cross-subdomain AJAX requests
	document.domain = document.domain.replace(/.*?([^\.]+\.[^\.]+)$/, '$1');

	var src, xds, iframes = [];

	$('script').each(function(){
		if((src = this.src).indexOf('xd.js') < 0){ return; }
		xds = src.substr(src.indexOf('#') + 1).split(',');

		$.each(xds, function(){
			stc[this] = new (stc.Observable.extend({}))();

			iframes.push($('<iframe src="http://api.kb.#{domain}/xd.html##{subdomain}" id="xd-#{subdomain}" class="xd" />'.interpolate({
				domain    : document.domain + ((port = document.location.port) == 80 ? '' : ':' + port),
				subdomain : this
			}))[0]);
		});
	});

	appendFrames = function(){
		var body = $('BODY')[0];
		if(!body){
			return setTimeout(appendFrames, 0)
		}

		$.each(iframes, function(){
			body.appendChild(this);
		});
	}

	appendFrames();
})();