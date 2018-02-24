
var path = require('path'),
softpack = require('./index')
var config = {
    src: path.resolve(__dirname, 'src'),
    dist: path.resolve(__dirname, 'dist'),
    rootPath: path.resolve(__dirname)
}

softpack.server(config)
