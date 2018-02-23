var path = require('path');

module.exports = {
    src: path.resolve(__dirname, 'src'),
    dist: path.resolve(__dirname, 'dist'),
    requireMents: [],
    converter: {
        ".scss$": {
            filename: "[path]/[name].css",
            callbacks: [
                require('./func/sassRenderer')
            ]
        },
        // ".hbs$": {
        //     filename: "[path]/[name].html",
        //     callbacks: [
        //         require('./func/hbsRenderer')
        //     ]
        // },
        ".js$": {
            filename: "[path]/[name].js",
            callbacks: [
                require('./func/jsRenderer')
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
