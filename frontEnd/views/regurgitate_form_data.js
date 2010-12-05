function stringify(data){
	var out = [];
	for(var n in data){
		out.push('     "' + n + '":"' + data[n].toString().replace(/\"/g, '\\"') + '"');
	}
	return '{\n' + out.join(',\n') + '\n}';
}

module.exports = function(req, res, next){
	var postData = stringify(req.method=='POST' ? req.body : {});
	var getData  = stringify(req.query);

	res.send('<pre>Post Data:\n%s\n\nGet Data:\n%s</pre>'.sprintf(postData, getData));
};