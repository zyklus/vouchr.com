// list of 'global' params that should be validated when applicable
module.exports = {
	language : function(v){
		return {'fr' : 'fr', 'de' : 'de', 'all': 'all'}[(v || '').toLowerCase()] || 'en';
	}
}