var express = require('express')
var bodyParser = require('body-parser')
var mkdirp = require('mkdirp')
var EasyZip = require('easy-zip').EasyZip
var fs = require('fs')
var app = express()

var templater = require("./templater");

var fileUpdates = require('./fileUpdates.js')

app.use(express.static('static'))
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/getApp', function (req, res) {
  for (k in req.body){
    if (req.body[k] === "true") req.body[k] = true;
    if (req.body[k] === "false") req.body[k] = false;
  }
  console.log(req.body)
  generatePackage(req.body, function(url) {
    console.log("Created package " + url)
    res.send(url)
  })
})

app.listen(3000, function () {
  console.log('ProjectAwesome listening on port 3000!')
})

function generatePackage(query, callback){
  var ID = generateUniqueIdentifier();

  templater.Template(query, function(files){
    createDirectory(ID, function(){
      createSubdirectories(files, ID, function(){
        for (fileName in files){
          fs.writeFileSync("storage/" + ID + "/" + fileName, files[fileName]);
        }
        compressFile(ID, function(){
          callback(ID)
        })
      })
    })
  })
}

function generateUniqueIdentifier() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

  for(var i=0; i<16; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  return text
}

function createDirectory(identifier, callback) {
  mkdirp('./storage/' + identifier, function(err) { 
      callback()
  })
}

function createSubdirectories(fileList, identifier, callback) {
  var created = []
  for (fileIndex in fileList) {
    var folder = fileIndex.split("/")
    folder.pop()
    if (String(folder) != "" && created.indexOf(folder.join("/")) == -1) {
      mkdirp.sync('./storage/' + identifier + "/" + folder.join("/"))
      created.push(folder.join("/"))
    }
  }
  callback()
}

function compressFile(identifier, callback) {
  var zip = new EasyZip()
  zip.zipFolder('./storage/' + identifier, function() {
    zip.writeToFile('./static/archives/' + identifier + ".zip")
  })
  callback()
}