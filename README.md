# softpack

If you have any questions or want to contribute please contact me at meistermilad@gmail.com

<b>Note: This module uses anymatch and has Bash-parity, please be aware that Windows-style backslashes are not supported as separators. See https://github.com/micromatch/micromatch#backslashes for more information.</b>

<h2>Installation</h2>

`npm install softpack` or `npm install softpack -g`

<h2>cli usage</h2>

<h6>Create a config file</h6>

`softpack --boilerplate config` 
and save output as `softpack.config.js`
or where you want it if you use api instead of cli

<h6>Create boilerplate code</h6>

type `softpack --boilerplate` to see availeble boilerpaltes

use like `softpack --boilerplate {boilerplateName}`
and save output where you want it

<h6>Create boilerplate code</h6>

type `softpack --boilerplate` to see availeble boilerpaltes

use like `softpack --boilerplate {boilerplateName} > myFile.js`

<h6>Run server</h6>

`softpack --server`

<h6>Run build process</h6>

`softpack --build`



<h2>API usage</h2>

Softpack takes a <a href="#config">configuration</a> to perform function/s on the given context of files that where registered through an regEx.



a small starter script could look like this:

```javascript

var softpack = require('softpack');
var path = require('path');
var nodeSass = require('node-sass');

softpack.server({
  dist: 'dist',
  src: 'src',
  rootPath: path.resolve(__dirname),
  actions:[
    {
      test: '**/*.scss'
      render: [
        function(context, objectData, yourSoftPackConfig) {
          return nodeSass.renderSync({
              file: objectData.fullPath,
              outputStyle: "expanded"
          }).css
        }
      ]
    }
  ]
})

```

this would watch all files in your project with the extension '.scss' and compile it to css files

every render or init function will get three parameters. 
 - context of current processed file
 - object of current processed file 
 - configuration passed to softpack


It comes with two function.
```javascript

var softpack = require('softpack');
var path = require('path');

var config = {
  rootPath: path.resolve(__dirname),
};
/* run developement server */
softpack.server(config);
/* run build process */
softpack.build(config);

```





<h3 id="config">config options:</h3>

|   name    |   type  | optional | description |
| --- | --- | --- | --- |
| BUILD | boolean | no |  will be set by softpack on build and server start |
| start | function | yes | perform a function on server / build start. gets the config as only parameter |
| end | function | yes | perform a function on server / build end. gets the config as only parameter |
| src | string | yes | defines the source directory to read / compile served files. 'src' by default |
| dist | string | yes | defines the distrubution directory to write files on build. 'dist' by default |
| rootPath | string | no | absolute path to directory where src directory is |
| ignore | array | yes | list of files or directory to ignore. glob or regEx |
| socketCallbacks | object | yes | object with [key]:function format. can be emitted by frontend like. needs socketLoad to be true on served file |
| log | object | yes | configures the output. <a href="#logoption">see more</a> |
| actions | array | yes | list of objects with configurations. <a href="#actionoption">see more</a> |



<h3 id="logoption">log parameter:</h3> 

| name | type | default | description |
| --- | --- | --- | --- |
| change | boolean | false | output when watched file was changed |
| serve | boolean | false | output when file was served |
| add | boolean | true | output when file was added to watcher |
| delete | boolean | true | output when file was deleted |



<h3 id="actionoption">actions object parameter:</h3> 
 
| name | type | optional | description |
| -- | --- | --- | --- |
| test | string | no | glob or regEx used to match files |
| fileName | string | yes | relative path with filename that is used to request file on serve and save on build. [path] is replaced with relative path or current file and [name] is replace with filename of current file (without extension) |
| buildName | string | yes | will bundle matched files |
| init | array | yes | array of functions that will execute when file is added to watcher or did change. get three parameter (context , current object, complete config) |
| render | array | yes | array of functions that will execute when file is requested. get three parameter (context , current object, complete config). should modify the context. must have a return. will also apply on bundle if bundleName is set  |
| renderEach | array | yes | array of functions that will execute on each matched file before added to bundle. should modify the context. must have a return. |
| socketLoad | boolean | yes | will add socket.io snippet to enable socketCallbacks and auto reload on file changes |
| keep | boolean | yes | will keep file on build |  


example config:

```javascript
var config = {
  start: function(c) {
    if(c.BUILD) {
      console.log("starting build process")
    } else {
      console.log("starting server")
    }
  },
  end: function(c) {
    if(c.BUILD) {
      console.log("finished build process")
    } else {
      console.log("server ready")
    }
  },
  src: 'src',
  dist: 'dist',
  rootPath: path.resolve(__dirname),
  ignore: [
    /** ignores all */
    "src/ignored_all", 
    /** ignores all exept js files */
    "src/ignored_exept/(!*.js)",
    /** ignores all js files */
    "src/ignored_files/*.js", 
    /** ignores all scss files beginning with `_` */
    "src/ignored_specific/(_)*.scss", 
  ],
  socketCallbacks: {
    log: function (msg) {
      console.log(msg)
    },
    foo: function (o) {
      console.log("foo is emitted with", o.msg)
    }
  },
  log: {
    change: true,
    serve: true,
    add: true,
    delete: true,
  },
  actions: [
    {
      test: "**/*.hbs",
      init: [
        // iniFunction
      ]
    },
    {
      test: "js/**/*.js",
      bundleName: "js/main.js",
      render: [
        // renderFunction
      ]
    },
    {
      test: "**/*.scss",
      bundleName: "css/main.css",
      renderEach: [
        // renderEachFunction
      ]
    },
    {
      test: "**/*.html",
      fileName: "[path]/[name].html",
      socketLoad: true,
      render: [
        // renderFunction
      ]
    }
  ]
}
softpack.server(config)
// softpack.build(config)
```


the `softpack.server` and `softpack.build` function take the same configuration


`socketCallbacks` example:

```javascript
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
```

and on frontend

```javascript
...
socket.emit("log", "hello server")
socket.emit("foo", {
 msg: "hello foo!"   
})
...
```


the diffrence between the functions inside the `init` array and the `render` array are that the functions inside the `init` array will execute once a file was added to the watcher or changed and the functions inside the `render` array are executed when the file is requested through the `fileName` path.
Render functions must return a context.

when setting the `fileName` you can add `[path]` and `[name]`.
`[path]` will be replaced with the relative path of current processed file. 
`[name]`is replaced with the name of the current processed file, but without file extension.

init function example:
<pre>
var handlebars = require('handlebars');
var hbsRenderer = function (context, config) {
    return handlebars.compile(context)({})
}
</pre>
When `hbsRenderer` is now applied to an render array it will perform the handlebars compile function,
add `{}` as the templates context and return the compiled string.
Obviously you would most likely add some more data than `{}`, but thats up to you.

render function example:
<pre>
var path = require('path');
var handlebars = require('handlebars');
var registerHbsPartial = function(context, config) {
    handlebars.registerPartial(config.fileName.replace(path.extname(config.fileName), ''), context) 
}
</pre>
here we would for example register `path/to/my/partials/person.hbs` as `person`


