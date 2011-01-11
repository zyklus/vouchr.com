var step = require('step'),
     api = require(__dirname + '/../../api');


var steps = step.fn(function(){
	api.region.getList({}, this.parallel());

}, function(err, regions){
	if(err){ throw err; }

	this.shared.res.send(this.shared.res.partial('collect', {locals: {regions:JSON.stringify(regions.regions)}}));
});


module.exports = function(req, res, next){
	steps({shared:{req:req,res:res,next:next}});
}