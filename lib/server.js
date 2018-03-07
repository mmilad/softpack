"use strict"

var mime = require('mime');
var path = require('path'),
  log = require('./logger'),
  defaultConfig = {
    actions: {},
    socketCallbacks: {}
  }
var testConfig = require('./testConfig')
function startServer(c) {
  testConfig(c)
  
  c.port = c.port ? c.port : 8000
  c.host = c.host ? c.host : "0.0.0.0" 
  var ignoreList = [], i;
  if(c.ignore) {
    if(typeof c.ignore === "string") {
      ignoreList.push(path.resolve(c.rootPath, c.ignore))
    } else if(Array.isArray(c.ignore)) {
      c.ignore.forEach(e => ignoreList.push(path.resolve(c.rootPath, path.normalize(e))));
    }
  }

  var fs = require('fs'),
    app = require('express')(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    chokidar = require('chokidar'),
    actions = [],
    config = Object.assign(defaultConfig, c),
    testFile = require('./testFile')(config),
    watcher = require('chokidar').watch(config.src, {
      ignored: ignoreList,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 100
      },
    }),
    srcPath = config.src,
    distPath = config.dist,
    url, srcUrl, distUrl;



  watcher
    .on('add', filePath => {
      log(filePath.replace(config.rootPath, ''), "success", "added to memory")
      testFile(filePath)
      testFile.change(filePath)
    })
    .on('change', (filePath, stats) => {
      testFile.change(filePath)
      io.emit('reload')
    })
    .on('unlink', filePath => log(`File ${filePath} has been removed`))

  app.get('/*', function (req, res) {
    url = req.originalUrl.endsWith('/') ? req.originalUrl + 'index.html' : req.originalUrl
    srcUrl = srcPath + url
    distUrl = distPath + url

    res.setHeader("Content-Type", mime.getType(url));
    if (testFile.memory[distUrl]) {
      log(url, "success", "serving from meory")
      testFile.memory[distUrl].render()
      res.send(testFile.memory[distUrl].context)
    } else if (fs.existsSync(srcUrl)) {
      log(url, 'notice', "served from src")
      res.sendFile(srcUrl)
    } else {
      log(url, 'error', "cannot find")
      res.send(req.originalUrl + " not found")
    }
  });

  io.on('connection', function (socket) {
    for(i in config.socketCallbacks) {
      socket.on(i, config.socketCallbacks[i])
    }
  });
  http.listen(c.port, c.host);
}
module.exports = startServer