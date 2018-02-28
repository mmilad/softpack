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
          if(currentPath) {
            if (!fs.existsSync(currentPath)){
              fs.mkdirSync(currentPath);
            }
          }
          currentPath += path.sep + folder;
          return currentPath;
        })
    }
  }

function build (c) {
    testConfig(c)
    testFile = require('./testFile')(c)
    if(c.ignore) {
      if(typeof c.ignore === "string") {
        ignoreList.push(path.resolve(c.rootPath, c.ignore))
      } else if(Array.isArray(c.ignore)) {
        c.ignore.forEach(e => ignoreList.push(path.resolve(c.rootPath, path.normalize(e))));
      }
    }
    var totalList = []
    walkSync(c.src)
        .filter(e => {
            var isIgnored = true
            ignoreList.forEach(p => {
                if(e.match(p)) {
                    isIgnored = false
                }
            });
            return isIgnored
        })
        .forEach(e => {
            totalList.push(e)
            testFile(e)
        });
    
    for(var i in testFile.memory) {
        totalList.splice(totalList.indexOf(testFile.memory[i].fullPath), 1);
        testFile.memory[i].change()
    }
    for(var i in testFile.memory) {
        testFile.memory[i].render()
        buildDir(i.replace(c.rootDir+path.sep, ''))
        fs.writeFileSync(i, testFile.memory[i].context )
    }

    console.log("not added", totalList)
}

module.exports = build