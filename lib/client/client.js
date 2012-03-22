/*!
 * json-db
 * Copyright(c) 2012 Philipp Spieß <philipp.spiess@myxcode.at>
 * MIT Licensed
 */

var fs = require('fs'),
    http = require('http'),
    querystring = require('querystring'),
    Collection = require('./collection')
//  , client = require('./client')


exports = module.exports = Client;


function Client (fn, options) {
  this.settings = {
      server: 'localhost',
      port: 3000,
      namespace: '/json-db',
      'username': null,
      'password': null
  };

  var self = this;

  for (var i in options) {
    this.settings[i] = options[i];
  }


  this.get('_ping', function(status, data){
    if(data.jsonDb) {
      console.log('[json-db] Client connected');

      if(typeof fn == 'function')
        fn(self)
    }
  })
}


Client.prototype.get = function(path, fn) {
  var options = {
    host: this.settings.server,
    port: this.settings.port,
    path: this.settings.namespace + '/' + path,
    method: 'GET',
    headers: this.authHeaders()
  }

  var req = http.request(options, function(res) {
    var body = '';
    res.on('data', function(chunk){
      body += chunk
    })
    res.on('end', function(){
      try {
        body = JSON.parse(body)
      } catch(ignore) { }

      fn(res.statusCode, body)
    })
  })

  req.end();
}

Client.prototype.post = function(path, obj, fn) {
  var options = {
    host: this.settings.server,
    port: this.settings.port,
    path: this.settings.namespace + '/' + path,
    method: 'POST',
    headers: this.authHeaders()
  }

  var req = http.request(options, function(res) {
    var body = '';
    res.on('data', function(chunk){
      body += chunk
    })
    res.on('end', function(){
      try {
        body = JSON.parse(body)
      } catch(ignore) { }

      fn(res.statusCode, body)
    })
  })

  req.write(JSON.stringify(obj))

  req.end();
}

Client.prototype.select = function(collection, fn) {
  return new Collection(collection, this, fn);
}

Client.prototype.authHeaders = function() {
  if(this.settings.username) {
    var auth = new Buffer(this.settings.username + ':' + this.settings.password).toString('base64')
    return {'Authorization' : 'Basic ' + auth}
  } else {
    return null
  }
}