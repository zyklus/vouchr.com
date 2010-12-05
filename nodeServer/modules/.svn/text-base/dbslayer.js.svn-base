/*
---
name: dbslayer.js
 
description: Interface to DBSlayer for Node.JS
 
author: [Guillermo Rauch](http://devthought.com)
updated: Andy Schuler (andy at leftshoedevevelopment dot com)
...
*/

// TODO: handle errors ala http://rentzsch.tumblr.com/post/664884799/node-js-handling-refused-http-client-connections

var  sys = require('sys'),
    http = require('http'),
  events = require('events');

var booleanCommands = ['STAT', 'CLIENT_INFO', 'HOST_INFO', 'SERVER_VERSION', 'CLIENT_VERSION'];

var Server = this.Server = function(host, port, timeout){
	this.host    = host || 'localhost';
	this.port    = port || 9090;
	this.timeout = timeout;
};

Server.prototype.fetch = function(object, key){
  var e = new events.EventEmitter();
  var connection = http.createClient(this.port, this.host);
  var query = JSON.stringify(object);
  var request = connection.request("GET",'/db?' + encodeURIComponent(JSON.stringify(object)), {'host': this.host});
  request.addListener('response',
    function(response) {
      var data = [];
      response.addListener('data',
        function(chunk) {
          data.push(chunk);
        }
      );
      response.addListener('end',
        function() {
          try {
            var object = JSON.parse(data.join(''));
          }
          catch(err) {
            e.emit('err',err);
            return;
          }

          if (object.MYSQL_ERROR !== undefined){
// TODO: remove this
console.log('MySQL Error: ' + object.MYSQL_ERROR);
          	e.emit('err', object.MYSQL_ERROR, object.MYSQL_ERRNO);
            return;
          } 
          if (object.ERROR !== undefined){
            e.emit('err', object.ERROR);
            return;
          } 

          e.emit('success', processResponse(key ? object[key] : object));
        }
      );
    }
  );
  request.end();
  return e;
}

Server.prototype.query = function(query){
  return this.fetch({SQL: query}, 'RESULT');
};

for (var i = 0, l = booleanCommands.length; i < l; i++){
  Server.prototype[booleanCommands[i].toLowerCase()] = (
    function(command){
      return function(){
        var obj = {};
        obj[command] = true;
        return this.fetch(obj, command);
      };
    }
  )(booleanCommands[i]);
}

function processResponse(obj){
	if(obj.ROWS){ // SELECT response
		var ret = [];
		for(var i=0, l=obj.ROWS.length; i<l; i++){
			var hash = {};
			for(var j=0, m=obj.HEADER.length; j<m; j++){
				hash[obj.HEADER[j]] = obj.ROWS[i][j];
			}
			ret.push(hash);
		}
		return ret;
	}

	if(obj.INSERT_ID){
		return obj;
	}
}