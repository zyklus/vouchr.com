/**
 * Exports the following:
 *
 * server
 *   debug
 *   port
 * log
 *   directory
 * database
 *   host
 *   port
 *   database
 * compression
 *   combine_files
 *   compress_files
 * authToken
 *   lifeInMinutes
 *   permanentLifeInMinutes
 */

var $ = require('languageHelpers'),

// Server-Specific settings go here
	servers = {
		local_development : {
			config : {
				debug : true,
				port  : 8001
			}
		},

		development : {
			config : {
				debug : true
			}
		},

		production : {
			// database : {
			// 	host : '184.106.237.238'
			// }
		}
	},

	server = servers[require('./which_server')];

// Global default settings go here

module.exports = {
	server : $.extend({
		port : 80
	}, server.config),

	log : {
		directory : '/var/log/vouchr/nodeServer'
	},

	database : $.extend({
		host     : '127.0.0.1',
		port     : '9091',
		database : 'vouchr'
	}, server.database),

	compression : $.extend({
		combine_files  : false,
		compress_files : false
	}, server.compression),

	authToken : $.extend({
		lifeInMinutes          : 60,
		permanentLifeInMinutes : 60*24*365 // 1 year
	}, server.authToken)
};