# softpack

Softpack takes a configuration to perform function on the given context of files that where registered through an regEx.

It comes with two function.
<pre>
var softpack = require("softpack")

/* run developement server */
softpack.server(config)

/* run build process */
softpack.build(config)
</pre>

Configuration for development server:

 - `src` path to source directory
 - `dist` path to build directory
 - `rootPath` absolute path to project
 - `port` default is 8000
 - `host` default is '0.0.0.0' ( localhost / yourIp)
 - `socketCallbacks` an object with key: function that can be registered if socket is enabled, the frontend can then emit to server to make debugging easier



note: 
while serving files from
`/my/path/to/project/{srcDirectory}/..`
will be availeble in 
`/my/path/to/project/{distDirectory}/..`

`actions` an array of of objet with the following properties:
 - `test` an anymatch regExp to path files like `".hbs"` (check npm anymatch package)
 - `init` an array of functions that recive 2 parameters (context and an object of the current processed configuration)
 - `render` an array of functions that recive 2 parameters (context and an object of the current processed configuration)
 - `keep` a boolean to keep or not keep original file on build (false by default)
 - `fileName` an absolute path to serve the current processed file with name and extension
 - `socketLoad` set to false to add socket.io support.
 - `bundleName` a string or function which returns a string, bundles all matching files 

the diffrence between the functions inside the `init` array and the `render` array are that the functions inside the `init` array will execute once a file was added to the watcher or changed and the functions inside the `render` array are executed when the file is requested through the `fileName` path.
Render functions must return a context.

when setting the `fileName` you can add `[path]` and `[name]`.
`[path]` will be replaced with the absolute path of current processed file. 
`[name]`is replaced with the name of the current processed file, but without file extension.

example config:
<pre>
var config = {
    src: path.resolve(__dirname, 'src'),
    dist: path.resolve(__dirname, 'dist'),
    rootPath: path.resolve(__dirname),
    actions: [
        {
            test: "*.hbs",
            init: [
                yourHandlebarPartialRegisterer
            ]
        }, {
            test: "*.hbs",
            fileName: "[path]/[name].html",
            render: [
                yourHandlebarTemplateRenderer
            ]
        }, {
            test: "*.html",
            fileName: "[path]/[name].html",
            socketLoad: true,
            render: [
                yourHtmlTemplatRenderer
            ]
        }, {
            test: "js/**/*.js",
            bundleName: "js/all.js",
            render: [
                jsRenderer
            ]
        }, {
            test: "**/*.scss",
            bundleName: "all.css",
            render: [
                yourSassRenderer
            ]
        }
    ]
}
softpack.server(config)
</pre>

note that we are looking for files that end with `scss` but register them as `css` so we dont need to change path`s after building our project

the `softpack.server` and `softpack.build` function take the same configuration

render function example:

<pre>
var handlebars = require('handlebars');
var hbsRenderer = function (o) {
    return handlebars.compile(o.context)({})
}
</pre>

When `hbsRenderer` is now applied to an render array it will perform the handlebars compile function,
add `{}` as the templates context and return the compiled string.
Obviously you would most likely add some more data than `{}`, but thats up to you.