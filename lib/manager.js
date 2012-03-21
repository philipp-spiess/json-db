/*!
 * json-db
 * Copyright(c) 2012 Philipp Spieß <philipp.spiess@myxcode.at>
 * MIT Licensed
 */

var fs = require('fs')
 , Client = require('./client/client')


exports = module.exports = Manager;

String.prototype.startsWith = function(str) {
	return (this.match("^"+str)==str)
}


function Manager (server, options) {
  this.server = server
  this.cache = {}
  this.settings = {
    namespace: '/json-db',
    directory: 'data',
    username: null,
    password: null,
    publicRead: false // allows read without auth
  };

  var self = this;

  for (var i in options) {
    this.settings[i] = options[i];
  }

  try {
  	fs.mkdirSync(this.settings.directory, 0777)
  } catch(ignore) { }

  console.log('[json-db] Database listening')

  server.on('request', function (req, res) {

  	var xtra = false;
    

  	if(req.url.startsWith(self.settings.namespace)) {
  		var method = req.method, url = req.url.replace(self.settings.namespace, '')

  		// GET /_ping
    	if(method == 'GET' && url == '/_ping') {
    		self.auth('r', res, req, function() {
    			self.pingBack(res)
    		})
    		xtra = true
    	}

    	// GET /collection -> collection.all();
    	if(method == 'GET' && url.match(/^\/[a-zA-Z0-9-]+$/i)) {
    		self.auth('r', res, req, function() {
    			self.all(url.replace('/', ''), res)
    		})
    		xtra = true
    	}

    	// POST /collection -> collection.push();
    	if(method == 'POST' && url.match(/^\/[a-zA-Z0-9-]+$/i)) {
    		self.auth('w', res, req, function() {
    			self.push(url.replace('/', ''), req, res)
    		})
    		xtra = true
    	}
  	}

    // console.log('  [debug] ' + method + ' ' + url)

    if(!xtra) {
		  res.writeHead(404)
      res.end('Welcome to json-db. \nhttps://github.com/philipp-spiess/json-db')
    }
  })
}

/**
 * Generates a password and a username
 */
Manager.prototype.local = function() {
	this.settings.username = this.random()
	this.settings.password = this.random()
	return this;
}

/**
 * Creates the client for the Database
 */
Manager.prototype.client = function(fn) {
	return new Client(fn, this.settings)
}

/**
 * GET /ping
 */
Manager.prototype.pingBack = function(res) {
	res.writeHead(200)
	res.end(JSON.stringify({
			jsonDb: true
		})
	)
}

/**
 * GET /collection
 */
Manager.prototype.all = function(collection, res) {
	this.read(collection, function(code, data) {
		res.writeHead(code)
		res.write(JSON.stringify(data))
		res.end()
	})
}

/**
 * POST /collection
 */
Manager.prototype.push = function(collection, req, res) {
	var self = this, body = '';
	/**
	 * collect post data
	 **/
  req.on('data', function(chunk){
    body += chunk
  })
  req.on('end', function(){
    body = JSON.parse(body)
  	
    self.read(collection, function(code, data) {
    	// random id
			body['_id'] = self.random()
	    	
	    // uh, push it, push it ;>
	    data.push(body)

	    res.writeHead(code)
	    res.end(JSON.stringify({push:body}))

	    // write to file after sending response
	    self.write(collection)

    })
  })
}

/**
 * Reads a collection, often cached
 */
Manager.prototype.read = function(collection, fn) {
	var self = this
	/**
	 * Check if we have the file in cache :)
	 */
	if(self.cache[collection]) {
		fn(200, self.cache[collection])
	} else {
		fs.readFile(this.settings.directory + '/' + collection + '.json', 'utf8', function(err, data) {
		  /**
		   * Do NOT create collection if not exist, only on push
		   */
		  if(err && err.code == 'ENOENT') {
		  	self.cache[collection] = []
		  	fn(201, self.cache[collection])
		  } else {
		    self.cache[collection] = JSON.parse(data)
		    fn(200, self.cache[collection])
		  }
	 	})
	}
}

/**
 * Hard write a collection
 */
Manager.prototype.write = function(collection, fn) {
  var s = JSON.stringify(this.cache[collection])
  fs.writeFile(this.settings.directory + '/' + collection + '.json', s, 'utf8', function() {
  	if(typeof fn == 'function')
  		fn()
  })
}

/**
 * Generates random hex string
 */
Manager.prototype.random = function(fn) {
	return require('crypto').randomBytes(14).toString('hex')
}

/**
 * checkes wheather it needs auth
 */
Manager.prototype.auth = function(type, res, req, fn) {
	/**
	 * We need auth when credentials are set and either
	 *   - Access writing
	 *   - Access reading with no publicRead
	 */
	if(this.settings.username && (type == 'w' || (type == 'r' && !this.settings.publicRead))) {
		if(req.headers.authorization) {

			var auth = req.headers.authorization.replace('Basic ', '')
			auth = new Buffer(auth, 'base64').toString('ascii')

			auth = auth.split(':')

			if(auth[0] == this.settings.username && auth[1] == this.settings.password) {
				fn()
			} else {
				res.writeHead(401)
				res.end('{"error":"wrong auth"}')
			}
		} else {
			res.writeHead(401)
			res.end('{"error":"auth required"}')
		}
	} else {
		fn()
	}
}