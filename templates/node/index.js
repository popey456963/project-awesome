{{#ifequals engine "express"}}
var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('{{name}}: Hello World!');
});

app.listen(3000, function () {
  console.log('{{name}} listening on port 3000!');
});
{{/ifequals}}

{{#ifequals database "redis"}}
var redis = require('node-redis')

var client = redis.createClient(port, host, auth)
{{/ifequals}}

{{#ifequals database "sqlite"}}
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database();
{{/ifequals}}

{{#ifequals database "mongo"}}
var mongo = require('mongodb').MongoClient
var assert = require('assert')
 
var url = 'mongodb://localhost:27017/{{safestring name}}'
mongo.connect(url, function(err, db) {
  assert.equal(null, err)
  console.log("Connected correctly to server")
 
  db.close()
});
{{/ifequals}}

{{#ifequals database "mysql"}}
var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'me',
  password : 'secret',
  database : 'my_db'
});
 
connection.connect();
{{/ifequals}}

{{#ifequals database "postgresql"}}
var pg = require('pg');
var conString = "postgres://username:password@localhost/{{safestring name}}";

pg.connect(conString, function(err, client, done) {
  if(err) {
    return console.error('error fetching client from pool', err);
  }
});
{{/ifequals}}

{{#ifequals auth "passport"}}
var passport = require("passport")
{{/ifequals}}