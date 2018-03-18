var fs = require('fs'),
  path = require('path'),
  testFile,
  splitPath = require('./splitPath'),
  testConfig = require('./testConfig'),
  walk = require('./walk'),
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
  if (c.start) {
    c.start(c)
  }
  c = testConfig(c)

  require('rimraf')(c.dist, () => {

    testFile = require('./testFile')(c, true)

    var totalList = [];
    var currentFile;
    var walkedFiles = walk(path.resolve(c.rootPath, c.src), c.ignore)

    walkedFiles.forEach(filePath => {
      totalList.push(filePath)
      testFile(filePath)
      testFile.change(filePath)
    });
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
    
    if(c.end) {
      c.end(c)
    }
  })
}

module.exports = build