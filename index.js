
if(process.argv.indexOf('build')>-1) {
require('./lib/build')()
} else {
    require('./lib/server')()
}
