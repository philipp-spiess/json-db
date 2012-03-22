/*!
 * json-db
 * Copyright(c) 2012 Philipp Spieß <philipp.spiess@myxcode.at>
 * MIT Licensed
 */

var jsonDb = require('../')

var db = jsonDb.listen().local()

/**
 * get le client
 */
db.client(function(client) {
	
	/**
	 * select le collection
	 */
  var test = client.select('test')

  /**
   * list al items
   */
  test.all(function(err, obj) {
    //console.log(obj)

    /**
     * push two new item
     */
    test.push({foo:'bar'})
    test.push({foo:'foobar'})


    /**
     * Wait a bit, cause the push is asynchrounus
     */
    setTimeout(function() {
	    /**
	     * list all items again
	     */
	    test.all(function(err, obj) {
	    	//console.log(obj)

        if(obj.length >= 2) {
          console.log('          Success. Two items pushed.')
        } else {
          console.log('          Failed.')
        }

        db.close()
	    })

    }, 1000)

  })
})
