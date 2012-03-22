/*!
 * json-db
 * Copyright(c) 2012 Philipp Spieß <philipp.spiess@myxcode.at>
 * MIT Licensed
 */

exports.version = '0.0.1'
exports.protocol = 1

exports.Manager = require('./manager')

exports.listen = function (server, options, fn) {
  if ('function' == typeof options) {
    fn = options
    options = {}
  }

  if ('undefined' == typeof server) {
    // create a server that listens on port 80
    server = 3000;
  }

  if ('number' == typeof server) {
    // if a port number is passed
    var port = server

    if (options && options.key)
      server = require('https').createServer(options)
    else
      server = require('http').createServer()

    server.listen(port, fn)
  }

  // otherwise assume a http/s server
  return new exports.Manager(server, options)
}
