/** 
 * plase install babel-core, babel-preset-es2015 to use this boilerplate
 * ( npm install babel-core babel-preset-es2015 )
 */

var babel = require("babel-core");

/**
 * renders es6 syntax to es2015
 */
function jsRenderer(context, object, softPackConfig) {
    return babel.transform(context, {
        babelrc: false,
        presets: ['es2015']
    }).code;
}

/**
 * export
 */
module.exports = {
    babel: babel,
    render: jsRenderer
}