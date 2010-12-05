var hashlib = require('hashlib');

module.exports = {
	getGuid : function(){
		return hashlib.md5(Math.random());
	}
};