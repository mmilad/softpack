"use strict"
var logger = require('./logger');
function testConfig(config) {
  var test = true
  if (!config.src) {
    logger("no src in config", "error");
    test = false
  }
  if (!config.dist) {
    logger("no dist in config", "error");
    test = false
  }
  if (!config.rootPath) {
    logger("no rootPath in config", "error");
    test = false
  }
  if (!test) {
    process.exit(0)
  } else {
    logger("config ok", "success");
  }
}

module.exports = testConfig