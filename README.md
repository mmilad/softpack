# softpack


If you have any questions or want to support this project please write me at meistermilad@gmail.com

Softpack takes a <a href="#config">configuration</a> to perform function/s on the given context of files that where registered through an regEx.

a small starter script could look like this:

<pre>
<code>
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
              data: context,
              file: objectData.fullPath,
              outputStyle: "expanded"
          }).css
        }
      ]
    }
  ]
})
</code>
</pre>
this would watch all files in your project with the extension '.scss' and compile it to css files

every render or init function will get three parameters. 
 - context of current processed file
 - object of current processed file 
 - configuration passed to softpack


It comes with two function.
<pre>
var softpack = require("softpack")

/* run developement server */
softpack.server(config)

/* run build process */
softpack.build(config)
</pre>











<h4 id="config">config options:</h4>

|   name    |   type  | optional | description |
| --- | --- | --- | --- |
| `BUILD` | boolean | no |  will be set by softpack on build and server start |
| `start` | function | yes | perform a function on server / build start. gets the config as only parameter |
| `end` | function | yes | perform a function on server / build end. gets the config as only parameter |
| `src` | string | no | defines the source directory to read / compile served files |
| `dist` | string | no | defines the distrubution directory to write files on build |
| `rootPath` | string | no | absolute path to directory where src directory is |
| `ignore` | array | yes | list of files/ directory to ignore. regEx or glob |
| `socketCallbacks` | object | yes | object with [key]:function format. can be emitted by frontend like. needs socketLoad to be true on served file |
| `log` | object | yes | configures the output. <a href="#logoption">see more</a> |
| `actions` | array | yes | list of objects with configurations. <a href="#actionoption">see more</a> |



<h4 id="logoption">log parameter:</h4> 

| name | type | default | description |
| --- | --- | --- | --- |
| `change` | boolean | false | output when watched file was changed |
| `serve` | boolean | false | output when file was served |
| `add` | boolean | true | output when file was added to watcher |
| `delete` | boolean | true | output when file was deleted |



<h4 id="actionoption">actions object parameter:</h4> 
 
| name | type | optional | description |
| -- | --- | --- | --- |
| `test` | glob / regEx | no | used to match files |
| `fileName` | string | yes | relative path with filename that is used to request file on serve and save on build. `[path]` is replaced with relative path or current file and `[name]` is replace with filename of current file (without extension) |
| `buildName` | string | yes | will bundle matched files |
| `init` | array | yes | array of functions that will execute when file is added to watcher or did change. get three parameter (context , current object, complete config) |
| `render` | array | yes | array of functions that will execute when file is requested. get three parameter (context , current object, complete config). will also apply on bundle if `bundleName` is set  |
| `renderEach` | array | yes | array of functions that will execute on each matched file before added to bundle |
| `socketLoad` | boolean | yes | will add socket.io snippet to enable `socketCallbacks` and auto reload on file changes |
| `keep` | boolean | yes | will keep file on build |  


example config:
<pre>
<code>

var config = {
  /**
  * NOTE!
  * there are no functions defined by default.
  * the functions in the init, render and render arrays
  * are each are fictional
  */


  BUILD: '...' , // will be set by softpack

  /**
   * executes on start server / build
   * gets current configuration 
  */
  start: function(c) {
    if(c.BUILD) {
      console.log("starting build process")
    } else {
      console.log("starting server")
    }
  },


  /**
   * executes on server ready / build done
   * gets current configuration 
  */
  end: function(c) {
    if(c.BUILD) {
      console.log("finished build process")
    } else {
      console.log("server ready")
    }
  },

  /** relative path to build directory */
  src: 'src',

  /** relative path to build directory */
  dist: 'dist',

  /** absolute path to project root to find src directory */
  rootPath: path.resolve(__dirname),

  /** 
   * array of strings with anymatch pattern
   * to ignore files / directorys
   */
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

  /**
   * object with [key]:function format
   * can be emitted by frontend
   */
  socketCallbacks: {
    log: function (msg) {
      console.log(msg)
    },
    foo: function (o) {
      console.log("foo is emitted with", o.msg)
    }
  },

  /** object to define log output by server */
  log: {

    /** 
     * output when watched file was changed
     * false by default
     */
    change: true,

    /**
     * output when file was served 
     * false by default
     */
    serve: true,

    /**
     * output when file was added to watcher
     * true by default
     */
    add: true,

    /**
     * output when watched file was deleted
     * true by default
     */
    add: true,
  },

  /** and array of objects */
  actions: [
    {
      /** find all hbs files in all directories and subdirectories */
      test: "**/*.hbs",

      /** 
       * will execute when file is added to memory or was changed
       * does not take a return
       */
      init: [

        /** register handlebars partial */
        registerHbsPartial
      ]
    },
    {

      /** 
       * find all js files in all
       * directories and subdirectories under `js` directory
       */
      test: "js/**/*.js",

      /** bundles matched files to `js/main.js` */
      bundleName: "js/main.js",

      /**
       * array of functions that will execute each on each file
       * will also execute on the bundle
       * functions get two parameters
       * current context, currentObject config
      */
      render: [

        /** 
         * will run through all js files in `js/**`
         * will also run on the merged context of 
         * the bundle after their context is merged into `js/main.js`
         */
        jsRenderer
      ]
    },
    {
      /** find all scss files in all directories and subdirectories */
      test: "**/*.scss",

      /** bundles matched files to `css/main.css` */
      bundleName: "css/main.css",

      /**
       * array of functions that will execute each on each file
       * will also appy on the bundle
       * functions get two parameters
       * current context, currentObject config
       */
      renderEach: [

        /** 
         * will run through all scss files 
         * before their content is merged in `css/main.css` */
        scssRenderer
      ]
    },
    {

      /** get all html files in all directories and subdirectories */
      test: "**/*.html",

      /** will memorize file with processed path/name and html extension  */
      fileName: "[path]/[name].html",

      /** adds socket io snippet to enable reload on change and socketCallbacks */
      socketLoad: true,

      /**
       * array of functions that will execute each on each file
       * functions get two parameters
       * current context, currentObject config
       */
      render: [

        /** will render html files with handlebar engine */
        hbsRenderer
      ]
    }
  ]
}
softpack.server(config)
// softpack.build(config)
</code>
</pre>


the `softpack.server` and `softpack.build` function take the same configuration


<h1 id ="asd">foo</h1>
Configuration for server/build:

 - `src` path to source directory
 - `dist` path to build directory
 - `rootPath` absolute path to project
 - `port` default is 8000
 - `host` default is '0.0.0.0' ( localhost / yourIp)
 - `ignore` an array of strings with an anymatch pattern to ignore directories / files
 - `socketCallbacks` an object with `[key]`: `[function]` that can be registered if socketLoad is enabled, the frontend can then emit to server to make debugging easier
 - `log` an object to specify server log output
    - `change` log if a file has changed (faöse by default) 
    - `serve` log if a file was served (false by default) 
    - `add` log if a file was added to memory (true by default) 
    - `delete` log if file was deleted from memory (true by default) 
 - `actions` an array of of objet with the following properties:
    - `socketLoad` set to true to add socket io snippet to html files (disabled on build)
    - `test` an anymatch regExp to path files like `".hbs"` (check npm anymatch package)
    - `init` an array of functions that recive 2 parameters (context and an object of the current processed configuration)
    - `render` an array of functions that recive 2 parameters (context and an object of the current processed configuration)
    - `keep` a boolean to keep or not keep original file on build (false by default)
    - `fileName` an relative path to serve the current processed file with name and extension
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


