var step = require('step'),
      fs = require('fs'),
    path = require('path'),
basePath = __dirname.replace(/\/[^\/]+$/, '') + '/';

var steps = step.fn(function(req, res, next){
	this.shared.req  = req;
	this.shared.res  = res;
	this.shared.next = next;

	var files = (req.query.files || req.url.substr(req.url.indexOf('?') + 1)).split(','),
	    group = this.group(),
	     norm;

	if(!files.length){ res.send(404); return }

	res.contentType((req.query.format === 'json') ? 'foo.json' : files[0]);

	this.shared.files = files;

	for(var i=files.length-1; i>=0; i--){
		var norm = path.normalize(__dirname + '/../' + files[i]);
		if((norm.indexOf(basePath) !== 0) || (norm.indexOf(basePath + 'views/') == 0) || (norm.indexOf(basePath + 'partials/')==0)){
			res.send(403);
			return;
		}

		if(norm.substr(-2) == '/*'){
			getAllFiles(norm.substr(0, norm.length-2), group(), files);
			files.splice(i, 1);
		}else{
			fs.stat(norm, group());
		}
	}

}, function(err, stats){
	if(err){ this.shared.res.send(500); return;}

	var modTime = 0,
	      group = this.group(),
	          s = this.shared,
	         ix = -1,
	       toRm = [];

	(function checkStats(stats){
		for(var i=0, l=stats.length; i<l; i++){
			if(Array.isArray(stats[i])){
				checkStats(stats[i]);
				continue;
			}
			ix++;

			if(!stats[i].isFile()){
				toRm.push(ix);
				continue;
			}

			modTime = Math.max(modTime, new Date(stats[i].mtime).getTime());
		}
	})(stats);

	if(new Date(s.req.headers['If-Modified-Since'] || Date.now()).getTime() <= modTime){
		s.res.send(304);
	}
	s.modDate = new Date(modTime);

	for(var i=toRm.length-1; i>=0; i--){
		s.files.splice(toRm[i], 1);
	}

	for(var i=0, l=s.files.length; i<l; i++){
		fs.readFile(__dirname + '/../' + s.files[i], group());
	}

}, function(err, files){
	if(err){ this.shared.res.send(500); throw err; return; }

	var s = this.shared;

	s.res.headers['Last-Modified'] = s.modDate.toGMTString();
	s.res.headers['Cache-Control'] = 'public max-age=31557600';
	if(s.req.query.format === 'json'){
		var out = [];
		for(var i=0, l=files.length; i<l; i++){
			out.push(JSON.stringify(files[i].toString()));
		}
		s.res.send('[' + out.join(', ') + ']');
	}else{
		s.res.send(files.join('\n'));
	}
});

var getAllFiles = step.fn(function(path, cbStat, files){
	this.shared.path   = path;
	this.shared.cbStat = cbStat;
	this.shared.files  = files;

	fs.readdir(path, this);
}, function(err, files){
	if(err){ throw err; }

	var group = this.group(),
	        s = this.shared,
	    fpath;

	for(var i=0, l=files.length; i<l; i++){
		s.files.push((fpath = s.path + '/' + files[i]).replace(basePath, ''));

		fs.stat(fpath, group());
	}
}, function(err, stats){
	if(err){ throw err; }

	this.shared.cbStat(null, stats);
});

module.exports = function(req, res, next){
	steps({}, req, res, next);
};