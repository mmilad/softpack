var fs = require('fs'),
    path = require('path'),
    testFile = require('./testFile')
    splitPath = require('./splitPath')
    rootDir = splitPath(process.argv[1]).path
    config = require(rootDir+path.sep+'dev.config')

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

function build () {
    var x = walkSync(config.src).forEach(e => {
        testFile(e)
        console.log()
    })

    for(var i in testFile.memory) {
        testFile.memory[i].change()
        // console.log(i)
        // console.log(testFile.memory[i].file)
        buildDir(i.replace(rootDir+path.sep, ''))
        fs.writeFileSync(i,testFile.memory[i].file )
    }
    // console.log(x)
}
    
module.exports = build