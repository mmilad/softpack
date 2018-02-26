var path = require('path'),
  fs = require('fs'),
  splitPath = require('./splitPath'),
  log = require('./logger'),
  config,
  srcPath,
  distPath,
  actions = [],
  fileChangedesOn = {};



function getTestFile(c) {
  config = Object.assign({}, c)
  srcPath = config.src
  distPath = config.dist
  actions = config.actions
  return testFile
}


function testFile(filePath) {
  var memoryPath,
    sp = splitPath(filePath);
  if (!fileChangedesOn[filePath]) {
    fileChangedesOn[filePath] = {}
  }
  sp.path = sp.path.replace(srcPath, distPath);
  actions.forEach((e, index) => {
    if (filePath.match(e.test)) {
      memoryPath = e.fileName
        ? e.fileName.replace('[path]', sp.path).replace('[name]', sp.name.replace(path.extname(sp.name), ''))
        : filePath;

      if (!testFile.memory[memoryPath]) {
        testFile.memory[memoryPath] = {
          src: fs.readFileSync(filePath, 'utf8'),
          changed: false,
          fullPath: filePath,
          filePath: sp.path,
          fileName: sp.name
        }
      }
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
        testFile.memory[memoryPath].context = e.hotLoad
          ? testFile.memory[memoryPath].context + testFile.ioString
          : testFile.memory[memoryPath].context;
      }
      fileChangedesOn[filePath] = memoryPath
    }
  });
}

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