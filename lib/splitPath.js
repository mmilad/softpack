var path = require('path');
function splitPath (filePath) {
    var split = filePath.split(path.sep)
    return {
        name: split.pop(),
        path: split.join(path.sep)
    }
}
module.exports = splitPath