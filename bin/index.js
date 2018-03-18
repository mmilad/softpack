#!/usr/bin/env node

var path = require('path');
var fs = require('fs');
var userPath = process.cwd();
var configPath = path.resolve(userPath, 'softpack.config.js')

var contents;
var boilerPlates = [];
fs.readdirSync(path.resolve(__dirname, 'boilerplates')).forEach(e => {
    boilerPlates.push(e.replace('.js', ''))
})
var softpack = require('./../index');

var options = '--server,--build,--boilerplate'.split(',')

function checkBoilerPlate(name) {

    if(process.argv.indexOf(name) > -1) {
        if(process.argv[process.argv.indexOf(name)+1]) {
            var bpPath = path.resolve(__dirname, 'boilerplates', process.argv[process.argv.indexOf(name)+1])+'.js';
            if (fs.existsSync(bpPath)) {
                contents = fs.readFileSync(bpPath, 'utf8');
                console.log(contents)
            } else {
                console.log('no boilerplate found for:')
                console.log(process.argv[process.argv.indexOf(name)+1])
                console.log('plase choose on of these:')
                boilerPlates.forEach( e => {
                    console.log('->', e)
                })
            }
            process.exit()
        } else {
            console.log('plase choose on of these:')
            boilerPlates.forEach( e => {
                console.log('->', e)
            })
            process.exit()
        }
    }
}

checkBoilerPlate('--boilerplate')
checkBoilerPlate('--bp')

if (fs.existsSync(configPath)) {
    var config = require(configPath)
    if(process.argv.indexOf('--server') > -1) {
        softpack.server(config)
    } else if(process.argv.indexOf('--build') > -1) {
        softpack.build(config)
    } else {
        console.log('please choose on of following options:')
        options.forEach( e => console.log(e))
    }
} else {
    console.log("softpack.config.js not found")
    console.log('please run :\nsoftpack --boilerplate config > softpack.config.js\n\nto initialize a config file')
    process.exit()
}