# json-db [![Build Status](https://secure.travis-ci.org/philipp-spiess/json-db.png?branch=master)](http://travis-ci.org/philipp-spiess/json-db) #

Json-db is lightweight database for your node.js app.

It uses an HTTP request to handle the data transfer and saves objects as `.json` files to your hard drive and comes with absolutly no dependencies. Pure Javascript. Yeah.

# Implemented Yet #

  - Authentification
  - Push
  - All

# Features to be implemented soon #

  - Pop
  - Remove
  - Update
  - Peak

# A bit more detail please :trollface: #

Sure. Json-db is a fully RESTful json-only database. it stores items in collections, each collection can be seen as an JSON array.

## List All ##

With the basic namespace, a collection can be accessed this way:

    GET /node-js/collection

This will respond something like this    

	[{
      "foo":"bar",
	  "_id","224810f50e57edef3bc048297e81"
    }]

## Push Item ##

To push a new row to this collection, simply send a POST with some JSON in it.

    POST /node-js/collection
    {"foo":"bar"}

Followed by this response

    {"push": {
	  "foo":"bar",
	  "_id","224810f50e57edef3bc048297e81"
	}}

## Authentication please ##

Well, check this out: [Basic access authentication](http://en.wikipedia.org/wiki/Basic_access_authentication)

## Client ##

Hooray, Json-db comes with an client build in. Please check out "How to use it?" for further information.


# How to use it? #

Json-db is designed to easily integrate with your application. Please check out `test/common.js` for a simple use-case. More info to follow.