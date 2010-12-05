$(function(){
	return;
	var version = '1.0',
	    maxSize = 1 << 20; // 1MB

	if(!window.openDatabase || !window.localStorage || !JSON){
		alert('This browser is not supported');
		return;
	}

	Storage.prototype.setObject = function(key, value) { this.setItem(key, JSON.stringify(value)); }
	Storage.prototype.getObject = function(key) { return this.getItem(key) && JSON.parse(this.getItem(key)); }

	var db = openDatabase('stealThisCouponAdmin', version, 'Steal This Coupon Admin', maxSize);

	// create the api cache table if it doesn't exist
	db.transaction(function(t){
		t.executeSql('CREATE TABLE IF NOT EXISTS apiCalls('
			+ 'pk_id INTEGER NOT NULL AUTOINCREMENT,'
			+ 'api_path VARCHAR(255) NOT NULL,'
			+ 'api_data TEXT NOT NULL'
		+ ')')
	});
});