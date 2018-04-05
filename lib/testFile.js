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



function getTestFile(c) {
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
  actions.forEach((e, index) => {
    if (anymatch(path.resolve(config.src, e.test), filePath)) {
      memoryPath = e.fileName
        ? e.fileName.replace('[path]', sp.path).replace('[name]', sp.name.replace(path.extname(sp.name), ''))
        : filePath;
      bundleName = e.bundleName
      memoryPath = memoryPath.replace(srcPath, '').substr(1)
      if (!testFile.memory[memoryPath]) {
        testFile.memory[memoryPath] = {
          src: fs.readFileSync(filePath, 'utf8'),
          fullPath: filePath,
          filePath: sp.path,
          fileName: sp.name,
          keep: e.keep,
          socketLoad: e.socketLoad
        }
      }
      testFile.memory[memoryPath].context = testFile.memory[memoryPath].src
      testFile.memory[memoryPath].change = () => {
        if (e.init) {
          testFile.memory[memoryPath].context = testFile.memory[memoryPath].src
          e.init.forEach((cb) => {
            cb(
              testFile.memory[memoryPath].context,
              testFile.memory[memoryPath],
              config,
              testFile.memory
            )
          })
        }
      }
      testFile.memory[memoryPath].render = () => {
        if (e.render) {
          testFile.memory[memoryPath].context = testFile.memory[memoryPath].src
          e.render.forEach(cb => {
            testFile.memory[memoryPath].context = cb(
              testFile.memory[memoryPath].context,
              testFile.memory[memoryPath],
              config,
              testFile.memory
            )
          });
        }
      }
      fileChangedesOn[filePath] = memoryPath
      if (bundleName) {

        if (typeof bundleName === 'function') {
          bundleName = bundleName(testFile.memory[memoryPath])
        }
        bsp = splitPath(bundleName)
        if (!bundles[bundleName]) {
          bundles[bundleName] = {}
          testFile.memory[bundleName] = {
            fullPath: bundleName,
            filePath: bsp.path,
            keep: true,
            fileName: bsp.name,
            render: () => {
              testFile.memory[bundleName].context = "";
              for (var i in bundles[bundleName]) {
                if (e.renderEach) {
                  bundles[bundleName][i].context = bundles[bundleName][i].src
                  e.renderEach.forEach(cb => {
                    bundles[bundleName][i].context = cb(
                      bundles[bundleName][i].context,
                      bundles[bundleName][i],
                      config,
                      testFile.memory
                    );
                  });
                  testFile.memory[bundleName].context += bundles[bundleName][i].context
                } else {
                  testFile.memory[bundleName].context += bundles[bundleName][i].src
                }
                testFile.memory[bundleName].context += "\n";
              }
              if (e.render) {
                e.render.forEach(cb => {
                  testFile.memory[bundleName].context = cb(
                    testFile.memory[bundleName].context,
                    testFile.memory[bundleName],
                    config,
                    testFile.memory
                  );
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

testFile.actions = []
testFile.memory = {}
testFile.change = (filePath) => {
  if (testFile.memory[fileChangedesOn[filePath]]) {
    testFile.memory[fileChangedesOn[filePath]].context = testFile.memory[fileChangedesOn[filePath]].src = fs.readFileSync(filePath, "utf8")
    if(testFile.memory[fileChangedesOn[filePath]].change) {
      testFile.memory[fileChangedesOn[filePath]].change()
    }
  }
}
module.exports = getTestFile