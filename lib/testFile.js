var path = require('path'),
  fs = require('fs'),
  splitPath = require('./splitPath'),
  log = require('./logger'),
  anymatch = require('anymatch'),
  config,
  srcPath,
  distPath,
  actions = [],
  bundles = {},
  IS_BUILD,
  fileChangedesOn = {};



function getTestFile(c, isBuild) {
  IS_BUILD = isBuild
  c.src = path.resolve(c.rootPath, c.src)
  c.dist = path.resolve(c.rootPath, c.dist)
  config = Object.assign({}, c)
  srcPath = config.src
  distPath = config.dist
  actions = config.actions
  return testFile
}


function testFile(filePath) {
  var memoryPath,
    bundleName,
    bsp,
    sp = splitPath(filePath);
  if (!fileChangedesOn[filePath]) {
    fileChangedesOn[filePath] = {}
  }
  sp.path = sp.path.replace(srcPath, distPath);
  actions.forEach((e, index) => {
    if (anymatch(path.resolve(config.src, e.test), filePath)) {
      memoryPath = e.fileName
        ? e.fileName.replace('[path]', sp.path).replace('[name]', sp.name.replace(path.extname(sp.name), ''))
        : filePath;
      bundleName = e.bundleName
      if (!testFile.memory[memoryPath]) {
        testFile.memory[memoryPath] = {
          src: fs.readFileSync(filePath, 'utf8'),
          fullPath: filePath,
          filePath: sp.path,
          fileName: sp.name,
          keep: e.keep 
        }
      }
      testFile.memory[memoryPath].context = testFile.memory[memoryPath].src
      testFile.memory[memoryPath].change = () => {
        if(e.init) {
          testFile.memory[memoryPath].context = testFile.memory[memoryPath].src
          e.init.forEach((cb) => {
            cb(testFile.memory[memoryPath].context, testFile.memory[memoryPath])
          })
        }
      }
      testFile.memory[memoryPath].render = () => {
        if(e.render) {
          testFile.memory[memoryPath].context = testFile.memory[memoryPath].src
          e.render.forEach(cb => {
            testFile.memory[memoryPath].context = cb(testFile.memory[memoryPath].context, testFile.memory[memoryPath])
          });
        }
        testFile.memory[memoryPath].context = (!IS_BUILD && e.socketLoad)
          ? testFile.ioString + testFile.memory[memoryPath].context
          : testFile.memory[memoryPath].context;
      }
      fileChangedesOn[filePath] = memoryPath
      if(bundleName) {
        
        if (typeof bundleName === 'function') {
          bundleName = bundleName(testFile.memory[memoryPath])
        } else {
          bundleName = path.resolve(config.dist, bundleName)
        }
        bsp = splitPath(bundleName)
        if(!bundles[bundleName]) {
          bundles[bundleName] = {}
          testFile.memory[bundleName] = {
            fullPath: bundleName,
            filePath: bsp.path,
            fileName: bsp.name,
            render: () => {
              testFile.memory[bundleName].context = "";
              for(var i in bundles[bundleName]) {
                if(e.renderEach) {
                  e.renderEach.forEach(cb => {
                    testFile.memory[bundleName].context += cb(bundles[bundleName][i].src, bundles[bundleName][i]);
                  });
                } else {
                  testFile.memory[bundleName].context += bundles[bundleName][i].src
                }
                testFile.memory[bundleName].context += "\n";
              }
              if(e.render) {
                e.render.forEach(cb => {
                  testFile.memory[bundleName].context = cb(testFile.memory[bundleName].context, testFile.memory[bundleName]);
                });
              }
            }
          }
        }
        bundles[bundleName][memoryPath] = testFile.memory[memoryPath]
      }
    }
  });
}
testFile.bundles = bundles
testFile.ioString = `
<script src="/socket.io/socket.io.js"></script>
<script>
var socket = io();
socket.on("reload", function() {
    location.reload();        
});
</script>
`;

testFile.actions = []
testFile.memory = {}
testFile.change = (filePath) => {
  log(filePath, "success", "change on")
  if(testFile.memory[fileChangedesOn[filePath]]) {
    testFile.memory[fileChangedesOn[filePath]].src = fs.readFileSync(filePath, "utf8")
    testFile.memory[fileChangedesOn[filePath]].change()
  }
}
module.exports = getTestFile