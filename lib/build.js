var fs = require('fs'),
  path = require('path'),
  testFile,
  splitPath = require('./splitPath'),
  testConfig = require('./testConfig'),
  ignoreList = [];
var walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {

    filelist = fs.statSync(path.join(dir, file)).isDirectory()
      ? walkSync(path.join(dir, file), filelist)
      : filelist.concat(path.join(dir, file));

  });
  return filelist;
}

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
  testConfig(c)
  require('rimraf')(c.dist, () => {

    if (c.ignore) {
      if (typeof c.ignore === "string") {
        ignoreList.push(path.resolve(c.rootPath, c.ignore))
      } else if (Array.isArray(c.ignore)) {
        c.ignore.forEach(e => ignoreList.push(path.resolve(c.rootPath, path.normalize(e))));
      }
    }

    testFile = require('./testFile')(c)

    var totalList = []
    var watcher = require('chokidar').watch(c.src, {
      ignored: ignoreList
    })
    watcher
      .on('add', filePath => {
        totalList.push(filePath)
        console.log("chokidar added", totalList)
        testFile(filePath)
        testFile.change(filePath)
      })
      .on('ready', () => {
        for (var i in testFile.memory) {
          testFile.memory[i].render()
          buildDir(i.replace(c.rootDir + path.sep, ''))
          fs.writeFileSync(i, testFile.memory[i].context)
          if (!testFile.memory[i].keep) {
            var index = totalList.indexOf(testFile.memory[i].fullPath);
            if (index !== -1) {
              totalList.splice(index, 1)
            }
          }
        }
        totalList.forEach(file => {
          buildDir(splitPath(file.replace(c.src, c.dist)).path + path.sep)
          fs.writeFileSync(file.replace(c.src, c.dist), fs.readFileSync(file));
        })
        watcher.close();
      })
  })
}

module.exports = build