var fs = require('fs'),
  path = require('path'),
  testFile,
  splitPath = require('./splitPath'),
  testConfig = require('./testConfig'),
  ignoreList = [];

function buildDir(pathName) {
  if (pathName) {
    pathName = pathName
    pathName
      .split(path.sep)
      .reduce((currentPath, folder) => {
        if (currentPath) {
          if (!fs.existsSync(currentPath)) {
            fs.mkdirSync(currentPath);
          }
        }
        currentPath += path.sep + folder;
        return currentPath;
      })
  }
}

function build(c) {
  c.BUILD = true;
  if(c.start) {
    c.start(c)
  }
  c = testConfig(c)

  require('rimraf')(c.dist, () => {
    if (c.ignore) {
      if (typeof c.ignore === "string") {
        ignoreList.push(path.resolve(c.rootPath, c.ignore))
      } else if (Array.isArray(c.ignore)) {
        c.ignore.forEach(e => ignoreList.push(path.resolve(c.rootPath, path.normalize(e))));
      }
    }

    testFile = require('./testFile')(c, true)

    var totalList = [];
    var currentFile;
    var watcher = require('chokidar').watch(c.src, {
      ignored: ignoreList
    })
    watcher
      .on('add', filePath => {
        totalList.push(filePath)
        testFile(filePath)
        testFile.change(filePath)
      })
      .on('ready', () => {
        for (var i in testFile.memory) {
          currentFile = path.resolve(c.dist, i)
          if (testFile.memory[i].keep !== false) {
            testFile.memory[i].render()
            buildDir(currentFile)
            fs.writeFileSync(currentFile, testFile.memory[i].context)
          }
          var index = totalList.indexOf(testFile.memory[i].fullPath);
          if (index !== -1) {
            totalList.splice(index, 1)
          }
        }
        totalList.forEach(file => {
          buildDir(splitPath(file.replace(c.src, c.dist)).path + path.sep)
          fs.writeFileSync(file.replace(c.src, c.dist), fs.readFileSync(file));
        })
        watcher.close();
        if(c.end) {
          c.end(c)
        }
      })
  })
}

module.exports = build