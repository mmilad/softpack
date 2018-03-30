#!/usr/bin/env node

var path = require('path');
var fs = require('fs');
var userPath = process.cwd();
var configPath = path.resolve(userPath, 'softpack.config.js');
var config;
var contents;
var boilerPlates = [];
fs.readdirSync(path.resolve(__dirname, 'boilerplates')).forEach(e => {
    boilerPlates.push(e.replace('.js', ''))
})
var softpack = require('./../index');

var options = '--server,--build,--boilerplate'.split(',')

function checkBoilerPlate(name) {

    if (process.argv.indexOf(name) > -1) {
        if (process.argv[process.argv.indexOf(name) + 1]) {
            var bpPath = path.resolve(__dirname, 'lib', process.argv[process.argv.indexOf(name) + 1]) + '.js';
            if (fs.existsSync(bpPath)) {
                contents = fs.readFileSync(bpPath, 'utf8');
                if (process.argv.indexOf('--save') > -1) {
                    if (process.argv[process.argv.indexOf('--save') + 1]) {
                        fs.writeFileSync(process.argv[process.argv.indexOf('--save') + 1], contents)
                    }
                } else {
                    console.log(contents)
                }
            } else {
                console.log('no boilerplate found for:')
                console.log(process.argv[process.argv.indexOf(name) + 1])
                console.log('plase choose on of these:')
                boilerPlates.forEach(e => {
                    console.log('->', e)
                })
            }
            process.exit()
        } else {
            console.log('plase choose on of these:')
            boilerPlates.forEach(e => {
                console.log('->', e)
            })
            process.exit()
        }
    }
}

checkBoilerPlate('--boilerplate')
checkBoilerPlate('--bp')

if (fs.existsSync(configPath)) {
    config = require(configPath);
} else {
    config = require('./default.config');

}

if (process.argv.indexOf('--server') > -1) {
    softpack.server(config)
} else if (process.argv.indexOf('--build') > -1) {
    softpack.build(config)
} else {
    console.log('please choose on of following options:')
    options.forEach(e => console.log(e))
}
