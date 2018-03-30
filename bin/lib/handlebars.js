/** 
 * plase install handlebars to use this boilerplate
 * ( npm install handlebars )
 */

var fs = require('fs'),
    handlebars = require('handlebars'),
    path = require('path');


/**
 * use for debugging in handlebar templates like:
 * {{ json myObject }}
 */
handlebars.registerHelper('json', function (context) {
    return JSON.stringify(context, null, 4);
});


/**
 * registers a handlebar template as partial
 * for example my/partial/dir/myPartial.hbs
 * will be availeble like {{> myPartial }}
 */
function registerPartial(context, object, softPackConfig) {
    handlebars.registerPartial(object.fileName.replace(path.extname(object.fileName), ''), context)
}

/**
 * will compile a handlebar templated
 * tries to load a json file located in the same directory like the template
 * with the same name but with '.json' extension
 */
function renderTempalte(context, object, softPackConfig) {
    var tpl = handlebars.compile(context),
        data = {},
        dataPath = object.fullPath.replace(path.extname(object.fileName), '.json')
    if (fs.existsSync(dataPath)) {
        data = require(dataPath);
    }
    return tpl(data);
}


/**
 * export
 */
module.exports = {
    handlebars: handlebars,
    registerPartial: registerPartial,
    render: renderTempalte
}