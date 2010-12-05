var fs = require('fs');

function readDir(path, root, rootDir, fn){
	fs.readdirSync(path).forEach(function(filename){
		var s = fs.statSync(path + '/' + filename),
		        apiName, mod;

		if(s.isDirectory()){
			if(!/^_/.test(filename)){
				readDir(path + '/' + filename, false, rootDir, fn);
			}
			return;
		}

		if(root || !/\.js$/.test(filename)){ return; }

		apiName = (path + '/' + filename).replace(rootDir, '').replace(/\.js$/, '');

		// require is failing on empty files in Node 0.2.2
		try{
			mod = require(path + '/' + filename);
		}catch(err){
			return;
		}

		fn(apiName, mod);
	});
}

module.exports = function(path, root, fn){
	return readDir(path, root, path, fn);
}