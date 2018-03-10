"use strict"

var mime = require('mime');
var path = require('path');
var log = require('./logger');
var testConfig = require('./testConfig')
function startServer(c) {
  c = testConfig(c)
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
    config = c,
    testFile = require('./testFile')(config),
    watcher = require('chokidar').watch(config.src, {
      ignored: ignoreList,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 100
      },
    }),
    ioString = `
    <script src="/socket.io/socket.io.js"></script>
    <script>
    var socket = io();
    socket.on("reload", function() {
        location.reload();        
    });
    </script>
    `,
    srcPath = config.src,
    distPath = config.dist,
    url, srcUrl, distUrl, currentContext;

  watcher
    .on('add', filePath => {
      if(config.log.add) {
        log(filePath.replace(config.rootPath, ''), "success", "added to memory")
      }
      testFile(filePath)
      testFile.change(filePath)
    })
    .on('change', (filePath, stats) => {
      if(config.log.change) {
        log(filePath, "success", "change on")
      }
      testFile.change(filePath)
      io.emit('reload')
    })
    .on('unlink', filePath => {
      if(config.log.delete) {
        log(`File ${filePath} has been removed`)
      }
    })

  app.get('/*', function (req, res) {
    url = req.originalUrl.endsWith('/') ? req.originalUrl + 'index.html' : req.originalUrl
    srcUrl = srcPath + url
    distUrl = distPath + url
    url = url.substr(1);
    res.setHeader("Content-Type", mime.getType(url));
    if (testFile.memory[url]) {
      if(config.log.serve) {
        log(url, "success", "serving from meory")
      }
      testFile.memory[url].render()
      currentContext = testFile.memory[url].context
      if(testFile.memory[url].socketLoad) {
        if(currentContext.search('</head>') > -1) {
          currentContext = currentContext.replace('</head>', ioString)
        } else {
          currentContext = ioString + currentContext;
        }
      }
      res.send(currentContext)
    } else if (fs.existsSync(srcUrl)) {
      if(config.log.serve) {
        log(url, 'notice', "served from src")
      }
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