var express = require('express')
var mkdirp = require('mkdirp')
var _ = require('lodash')
var app = express()

var fileUpdates = require('./fileUpdates.js')

app.use(express.static('static'))

app.get('/getApp', function (req, res) {
  handleRequest(req.query, function(url) {
    res.send(url)
  })
  
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})

function handleRequest(query, callback) {
  makeDirectory(function(location) {
    makeFileList(query, function(fileList) {
      callback(location + "<br />" + JSON.stringify(fileList))
    })
  })
}

function makeDirectory(callback) {
  var generateName = makeid()
  mkdirp('./storage/' + generateName, function(err) { 
    callback(generateName)
  });
}

function makeFileList(query, callback) {
  var fileList = []
  for (field in query) {
    if (_.includes(fileUpdates.allowed, field)) {
      if (query[field] == "true") {
        if (_.has(fileUpdates, field)) {
          fileList = _.union(fileList, fileUpdates[field])
        }
      }
    }
  }
  callback(fileList)
}

function makeid() {
  // With 64 characters, our chance of collisions are basically nill. (5x10^114)
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < 64; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}