"use strict"
var fs = require('fs'),
    app = require('express')(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    chokidar = require('chokidar'),
    path = require('path'),
    testFile = require('./testFile'),
    splitPath = require('./splitPath'),
    converter = [],
    config = require(splitPath(process.argv[1]).path+path.sep+'dev.config'),
    watcher = require('chokidar').watch(config.src, {
        awaitWriteFinish: {
            stabilityThreshold: 100,
            pollInterval: 100
        },
    }),
    srcPath = config.src,
    distPath = config.dist,
    url, srcUrl, distUrl;

testFile.ioString = `
    <script src="/socket.io/socket.io.js"></script>
    <script>
    var socket = io();
    socket.on("reload", function() {
        location.reload();        
    });
    </script>
`;
    


    var log = console.log
watcher
    .on('add', filePath => testFile(filePath))
    .on('change', (filePath,stats) => {
        testFile.change(filePath)
        io.emit('reload')
    })
    .on('unlink', filePath => log(`File ${filePath} has been removed`))
function startServer() {
    app.get('/*', function(req, res) {
        url = req.originalUrl.endsWith('/') ? req.originalUrl+'index.html' : req.originalUrl
        srcUrl = srcPath+url
        distUrl = distPath+url
        if(testFile.memory[distUrl]) {
            console.log("requested on \t\t", distUrl )
            testFile.memory[distUrl].change()
            res.send(testFile.memory[distUrl].data)
        } else if(fs.existsSync(distUrl)) {
            res.sendFile(distUrl)
        } else {
            res.send(req.originalUrl+ " not found")
        }
    });
    
    io.on('connection', function(socket){
      console.log('a user connected');
    });
    
    log("start go")
    http.listen(8000, '0.0.0.0');
}

module.exports = startServer