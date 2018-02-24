var path = require('path');

module.exports = {
    src: path.resolve(__dirname, 'src'),
    dist: path.resolve(__dirname, 'dist'),
    rootPath: path.resolve(__dirname),
    requireMents: [],
    devCheck: {
        ".scss$": {
            filename: "[path]/[name].css",
            callbacks: [
                function(e) {
                    return e.data
                }
            ]
        },
        ".hbs$": {
            filename: "[path]/[name].html",
            callbacks: [
                function(e) {
                    return e.data
                }
            ]
        },
        ".js$": {
            filename: "[path]/[name].js",
            callbacks: [
                function(e) {
                    return e.data
                }
            ]
        },
        ".html$": {
            filename: "[path]/[name].html",
            hotLoad: true,
            callbacks: [
                function(e) {
                    return e.data
                }
            ]
        }
    }
}
