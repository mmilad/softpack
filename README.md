# softpack

Softpack takes a configuration to perform function on the given context of files that where registered through an regEx.

added github.

there will be more updates in the future!


It comes with two function.
<pre>
var softpack = require("softpack")

/* run developement server */
softpack.server(config)

/* run build process */
softpack.build(config)
</pre>

Configuration for server/build:

 - `src` path to source directory
 - `dist` path to build directory
 - `rootPath` absolute path to project
 - `port` default is 8000
 - `host` default is '0.0.0.0' ( localhost / yourIp)
 - `ignore` an array of strings with an anymatch pattern to ignore directorys / files
 - `socketCallbacks` an object with `key: function` that can be registered if socketLoad is enabled, the frontend can then emit to server to make debugging easier
 - `actions` an array of of objet with the following properties:
    - `socketLoad` set to true to add socket io snippet to html files (disabled on build)
    - `test` an anymatch regExp to path files like `".hbs"` (check npm anymatch package)
    - `init` an array of functions that recive 2 parameters (context and an object of the current processed configuration)
    - `render` an array of functions that recive 2 parameters (context and an object of the current processed configuration)
    - `keep` a boolean to keep or not keep original file on build (false by default)
    - `fileName` an absolute path to serve the current processed file with name and extension
    - `socketLoad` set to false to add socket.io support.
    - `bundleName` a string or function which returns a string, bundles all matching files 

`socketCallbacks` example:

<pre>
...
socketCallbacks: {
    log: function(msg) {
        console.log(msg)
    },
    foo: function(o) {
        console.log("foo is emitted with", o.msg)
    }
}
...
</pre>
and on frontend

<pre>
...
socket.emit("log", "hello server")
socket.emit("foo", {
 msg: "hello foo!"   
})
...
</pre>

note: 
while serving files from
`/my/path/to/project/{srcDirectory}/..`
will be availeble in 
`/my/path/to/project/{distDirectory}/..`


the diffrence between the functions inside the `init` array and the `render` array are that the functions inside the `init` array will execute once a file was added to the watcher or changed and the functions inside the `render` array are executed when the file is requested through the `fileName` path.
Render functions must return a context.

when setting the `fileName` you can add `[path]` and `[name]`.
`[path]` will be replaced with the absolute path of current processed file. 
`[name]`is replaced with the name of the current processed file, but without file extension.

example config:

<pre>
var config = {
    src: 'src',
    dist: 'dist',
    rootPath: path.resolve(__dirname),
    ignore: [
        "src/ignored",
        "src/ignored_also",
    ],
    socketCallbacks: {
        log: function(msg) {
            console.log(msg)
        },
        foo: function(o) {
            console.log("foo is emitted with", o.msg)
        }
    },
    log: {
        change: true,
        server: true,
    },
    actions: [
        {
            test: "**/*.hbs",
            init: [
                hbs.registerPartial
            ]
        },
        {
            test: "**/*.scss",
            bundleName: "css/main.css",
            renderEach: [
                style.sass
            ]
        },
        {
            test: "js/**/*.js",
            bundleName: "js/all.js",
            render: [
                jsRenderer
            ]
        },
        {
            test: "**/*.html",
            fileName: "[path]/[name].html",
            socketLoad: true,
            render: [
                hbs.renderTempalte
            ]
        }
    ]
}
softpack.server(config)
// softpack.build(config)

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