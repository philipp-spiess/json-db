/*!
 * json-db
 * Copyright(c) 2012 Philipp Spieß <philipp.spiess@myxcode.at>
 * MIT Licensed
 */

exports = module.exports = Collection

function Collection (collection, client, fn) {
  this.client = client
  this.collection = collection
  var self = this

  if(typeof fn == 'function')
    fn(this)

}

Collection.prototype.all = function(fn) {
  this.client.get(this.collection, function(code, obj) {
    if(code == 404) {
      err = true
    } else {
      err = false
    }

    fn(err, obj)
  })
}

Collection.prototype.push = function(obj, fn) {
  this.client.post(this.collection, obj, function(code, obj) {
    if(code == 404) {
      err = true
    } else {
      err = false
    }
    
    if(typeof fn == 'function')
      fn(err, obj)
  })
}