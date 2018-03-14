"use strict"
var logger = require('./logger');
var path = require('path');

function testConfig(config) {
  var test = true
  if (!config.src) {
    config.src  ='src'
  }
  if (!config.dist) {
    config.dist  ='dist'
  }
  if (!config.rootPath) {
    logger("no rootPath in config", "error");
    test = false
  }
  if (!test) {
    process.exit(0)
  } else {
    logger("config ok", "success");
    var c = Object.assign({
      actions: {},
      socketCallbacks: {},
      port: 8000,
      host: "0.0.0.0",
    }, config)
    c.log = Object.assign({
      change: false,
      serve: false,
      add: true,
      delete: true
    }, config.log ? config.log : {})

    c.src = path.resolve(config.rootPath, c.src)
    c.dist = path.resolve(config.rootPath, c.dist)
    return c
  }
}

module.exports = testConfig