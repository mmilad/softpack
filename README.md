# softpack

Softpack takes a configuration to perform function on the given context of files that where registered through an regEx.

It comes with two function.

like:
<pre>
var config = {
    src: path.resolve(__dirname, 'src'),
    dist: path.resolve(__dirname, 'dist'),
    rootPath: path.resolve(__dirname),
    actions: [
        {
            test: ".hbs$",
            init: [
                yourHandlebarPartialRegisterer
            ]
        }, {
            test: ".hbs$",
            fileName: "[path]/[name].html",
            render: [
                yourHandlebarTemplateRenderer
            ]
        }, {
            test: ".html$",
            fileName: "[path]/[name].html",
            hotLoad: true,
            render: [
                yourHtmlTemplatRenderer
            ]
        }, {
            test: ".scss$",
            fileName: "[path]/[name].css",
            render: [
                yourSassRenderer
            ]
        }
    ]
}
softpack.server(config)
</pre>

`test` should be a regular expression to check if current file should undergo the init / render procedure

the `init` array holds functions that should be performed after a file is found by the watcher or changed.

the `render` array holds functions that will execute when the file was requested.
this functions will get an object and must return a modified context.

`filename` tells the memory under which filename it should serve the file.

`[path]` will be replaced by the path of current processing file.

`[name]` will be replaced by the name of current file (without extension)

note that we are looking for files that end with `scss` but register them as `css` so we dont need to change path`s after building our project

the functions get two parameters. The first is the current context and the second is an object with the following properties.

`src`
holds the source code of the processed file
`fullPath`
holds the absolute path of processed file (/home/path/filename.extension)
`filePath`
holds the absolute path of processed file withour filename 
(/home/path)
`fileName`
hold filename of processed file (filename.extension)
`context`
holds current context, will be modified with each return of a `render` function

render function example:
<pre>
var handlebars = require('handlebars');
var hbsRenderer = function (o) {
    return handlebars.compile(o.context)({})
}
</pre>

When `hbsRenderer` is now applied to an render array it will perform the handlebars compile function,
add `{}` as the templates context and return the compiled string.
Obviously you would most likely add sme more data than `{}`, but thats up to you.

