var express = require('express')
var bodyParser = require('body-parser')
var mkdirp = require('mkdirp')
var _ = require('lodash')
var EasyZip = require('easy-zip').EasyZip
var fs = require('fs')
var rimraf = require('rimraf')
var app = express()

var fileUpdates = require('./fileUpdates.js')

app.use(express.static('static'))
app.use(bodyParser.json());

app.post('/getApp', function (req, res) {
  for (k in req.body){
    if (req.body[k] === 'true' || req.body[k] === 'false'){
      req.body[k] = Boolean(req.body[k])
    }
  }
  generatePackage(req.body, function(url) {
    res.send(url)
  })
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})

var START_BLOCK = "╔══▓"
var END_BLOCK =   "╚══▓"

function generatePackage(query, callback) {
  createDirectory(function(identifier) {
    console.log("Identifier: " + identifier)
    makeFileList(query, function(fileList) {
      console.log("File List:  " + JSON.stringify(fileList))
      createSubdirectories(fileList, identifier, function() {
        templateController(fileList, identifier, query, function() {
          compressFile(identifier, function() {
            removeTempFiles(identifier, function() {
              callback(identifier)
            })
          })
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

function createDirectory(callback) {
  var identifier = generateUniqueIdentifier()
  mkdirp('./storage/' + identifier, function(err) { 
    callback(identifier)
  })
}

function makeFileList(query, callback) {
  var fileList = []
  for (field in query) {
    if (_.includes(fileUpdates.allowed, field)) {
      if (query[field]) {
        if (_.has(fileUpdates, field)) {
          fileList = _.union(fileList, fileUpdates[field])
        }
      }
    }
  }
  callback(fileList)
}

function createSubdirectories(fileList, identifier, callback) {
  for(fileIndex in fileList) {
    var folder = fileList[fileIndex].split("/")
    folder.shift()
    folder.shift()
    folder.pop()
    if (String(folder) != "") {
      console.log("Created File: " + './storage/' + identifier + "/" + folder.join("/"))
      mkdirp.sync('./storage/' + identifier + "/" + folder.join("/"))
    }
  }
  callback()
}

function templateController(fileList, identifier, query, callback) {
  for(fileIndex in fileList)
    fileTemplater(fileList[fileIndex], identifier, query)
  callback()
}

function fileTemplater(file, identifier, query) {
  try {
    fileLocation = './storage/' + identifier + "/" + file.replace('/node/', '')
    var contents = fs.readFileSync('./templates' + file).toString()
    fs.closeSync(fs.openSync(fileLocation, 'w'))
    var fileLines = contents.match(/[^\r\n]+/g)
    currentRestrictions = []

    for(lineNo in fileLines) {
      cache = false
      write = true
      line = fileLines[lineNo]

      if(line.substring(0, START_BLOCK.length) == START_BLOCK) {
        currentRestrictions.push(line.split("▓")[1])
        cache = false
      } else if(line.substring(0, END_BLOCK.length) == END_BLOCK) {
        index = currentRestrictions.indexOf(line.split("▓")[1])
        cache = false
        if(index > -1)
          currentRestrictions.splice(index, 1)
        else
          console.log("We tried to go out from " + line.split("▓")[1] + " but we couldn't!  It wasn't there.")
      } else {
        if(!cache) {
          var write = true
          for(item in currentRestrictions) {
            if(_.has(query, currentRestrictions[item]) || !query[currentRestrictions[item]]) {
              write = false
            }
          }
        }
        if (write) {
          fs.appendFileSync(fileLocation, line + "\n")
        }
      }
    }
  } catch(e) {
    if (e.code == "ENOENT") {
      console.log("File doesn't exist: " + './templates' + file)
    } else {
      console.log(e)
      console.log("Unknown error occured whilst templating" + './templates' + file)
    }
  }
}

function compressFile(identifier, callback) {
  var zip = new EasyZip()
  zip.zipFolder('./storage/' + identifier, function() {
    zip.writeToFile('./static/archives/' + identifier + ".zip")
  })
  callback()
}

function removeTempFiles(identifier, callback) {
  rimraf("./storage/" + identifier, callback)
}