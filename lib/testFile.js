var path = require('path'),
    fs = require('fs'),
    splitPath = require('./splitPath'),
    rootPath = splitPath(process.argv[1]).path,
    config = require(rootPath+path.sep+'dev.config'),
    srcPath = config.src,
    distPath = config.dist,
    converter = [],
    fileChangedesOn = {};
    
for (var i in config.converter) {
    converter.push({
        test: new RegExp(i, 'ig'),
        hotLoad: config.converter[i].hotLoad ? config.converter[i].hotLoad : false,
        filename: config.converter[i].filename ? config.converter[i].filename : false,
        callbacks: config.converter[i].callbacks
    });
}
function testFile (filePath) {
        var memoryPath,
            sp = splitPath(filePath);
    if(!fileChangedesOn[filePath]) {
        fileChangedesOn[filePath] = {}
    }
    sp.path = sp.path.replace(srcPath, distPath);
    converter.forEach((e, index) => {
        if(filePath.match(e.test)) {
            memoryPath = e.filename 
                ? e.filename.replace('[path]', sp.path).replace('[name]', sp.name.replace(path.extname(sp.name), ''))
                : filePath;
                
            if(!testFile.memory[memoryPath]) {
                testFile.memory[memoryPath] = {
                    src: fs.readFileSync(filePath, 'utf8'),
                    changed: false,
                    filePath: filePath
                }
            }
            testFile.memory[memoryPath].change = () => {
                // var res = testFile.memory[memoryPath].srcFile;
                testFile.memory[memoryPath].data = testFile.memory[memoryPath].src
                e.callbacks.forEach(cb => {
                    testFile.memory[memoryPath].data = cb(testFile.memory[memoryPath])
                });
                testFile.memory[memoryPath].data = e.hotLoad
                    ? testFile.memory[memoryPath].data + testFile.ioString
                    : testFile.memory[memoryPath].data;
            }
            fileChangedesOn[filePath] = memoryPath
        }
    });
}
testFile.converter = []
testFile.ioString = ""
testFile.memory = {}
testFile.change = (filePath) => {
    console.log("change on \t\t", filePath )
    
    testFile.memory[fileChangedesOn[filePath]].src = fs.readFileSync(filePath, "utf8")
}
module.exports = testFile