var express = require('express')
var mkdirp = require('mkdirp')
var _ = require('lodash')
var EasyZip = require('easy-zip').EasyZip
var fs = require('fs')
var rimraf = require('rimraf')
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
  makeInitialDirectory(function(location) {
    makeFileList(query, function(fileList) {
      moreDirectoryHandling(fileList, location, function() {
        fileTemplatingMaster(fileList, location, query, function() {
          zipFile(location, function() {
            removeOldFolder(location, function() {
              callback(location + "<br />" + JSON.stringify(fileList))
            })
          })
        })
      })
    })
  })
}

function removeOldFolder(location, callback) {
  rimraf("./storage/" + location, callback)
}

function zipFile(location, callback) {
  var zip = new EasyZip()
  zip.zipFolder('./storage/' + location, function() {
    zip.writeToFile('./static/archives/' + location + ".zip")
  })
  callback()
}

function fileTemplatingMaster(fileList, location, query, callback) {
  for(file in fileList) {
    fileTemplater(fileList[file], location, query)
  }
  callback()
}

function fileTemplater(file, location, query) {
  var success = false
  try {
    var contents = fs.readFileSync('./templates' + file).toString()
    success = true
  } catch(e) {
    if (e.code == "ENOENT") {
      console.log("File doesn't exist: " + './templates' + file)
    } else {
      console.log("Unknown error occured whilst templating" + './templates' + file)
    }
  }
  if (success) {
    fs.closeSync(fs.openSync('./storage/' + location + "/" + file.replace('/node/', ''), 'w'));
    var fileLines = contents.match(/[^\r\n]+/g)
    currentRestrictions = []

    for(lineNo in fileLines) {
      line = fileLines[lineNo]
      if(line.substring(0, 4) == "╔══▓") {
        name = line.split("▓")[1]
        currentRestrictions.push(name)
      } else if(line.substring(0, 4) == "╚══▓") {
        name = line.split("▓")[1]
        index = currentRestrictions.indexOf(name)
        if(index > -1) {
          currentRestrictions.splice(index, 1);
        } else {
          console.log("We tried to go out from " + name + " but we couldn't!  It wasn't there.")
        }
        // We're going out one!
      } else {
        var write = true
        for(item in currentRestrictions) {
          if(_.has(query, currentRestrictions[item])) {
            if(!query[currentRestrictions[item]]) {
              write = false
            }
          } else {
            write = false
          }
        }
        if (write) {
          fs.appendFileSync('./storage/' + location + "/" + file.replace('/node/', ''), line + "\n")
        }
      }
    }
  }
}

function moreDirectoryHandling(fileList, generateName, callback) {
  for(file in fileList) {
    var folder = fileList[file].split("/")
    // DOES THIS ACTUALLY WORK?  I HONESTLY CAN'T TELL.
    // I LITERALLY JUST NEED THE SECOND ELEMENT TO THE -1 OR SOMETHING
    // HENCE, HARDCODED/LUCK?  :)
    folder = folder.splice(2, folder.length - 3)
    if (String(folder) != "") {
      console.log("Created File: " + './storage/' + generateName + "/" + folder.join("/"))
      mkdirp.sync('./storage/' + generateName + "/" + folder.join("/"))
    }
  }
  callback()
}

function makeInitialDirectory(callback) {
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

  for( var i=0; i < 16; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}