var step = require('step'),
     api = require(__dirname + '/../'),
  params = {
	language     : {type: 'string'},
	country_code : {type: 'string'}
};

module.exports = function(p){
	var countries;

	step(function(){
		var sql = p.sql
			.select  ('c.country_code', p.sql.raw("CASE WHEN r.name!='' THEN 'NA' ELSE 'IN' END region"), 'c.fk_country_string_id')
			.from    ('country c')

			// the data set we have has a couple of fake country codes for satellite, anonymous
			.where   (['country_code', 'NOT IN', p.sql.list('A1', 'A2')])
			.leftJoin('region r', ['c.fk_region_id=r.pk_id', 'r.pk_id=1']);

		if(p.data.country_code){
			sql.where(['country_code', p.data.country_code]);
		}

		sql.run     (this);

	}, function(err, _countries){
		if(err){ return p.error(err); }

		countries = _countries;

		var stringIDs = [];

		for(var i=0, l=countries.length; i<l; i++){
			stringIDs.push(countries[i].fk_country_string_id);
		}

		api.localize.getStrings({string_ids: stringIDs.join(','), language: p.data.language}, this);

	}, function(err, s){
		if(err){ return p.error(err); }

		var strings = s.strings;

		for(var i=0, l=countries.length; i<l; i++){
			countries[i].name = strings[i].string;
			delete countries[i].fk_country_string_id;
			if(!countries[i].region){ delete countries[i].region; }
		}

		var cVals = {US:'AAA', GB:'AAB', DE:'AAC', FR:'AAD', CA:'AAE', AU:'AAF'};
		countries.sort(function(a, b){
			return (cVals[a.country_code] || a.name) > (cVals[b.country_code] || b.name) ? 1 : -1;
		});
		countries.splice(Object.getOwnPropertyNames(cVals).length, 0, {});

		p.cb({countries:countries, root:'countries'});

	}, p.catchStepError);
};

module.exports.params = params;