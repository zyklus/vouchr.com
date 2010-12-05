var step = require('step');

module.exports = function(p){
	step(function(){
		p.sql.select('who cares').run('SELECT 1', this);
	}, function(err, resp){
		console.log(resp);
	});
};

module.exports.params = {};