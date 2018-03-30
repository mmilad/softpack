var js = require('./lib/babel'),
  hbs = require('./lib/handlebars'),
  sass = require('./lib/sass');
console.log(process.cwd())

module.exports = {
  start: function (softpackConfig) {
    if (softpackConfig.BUILD) {
      console.log("starting build process")
    } else {
      console.log("starting server")
    }
  },
  end: function (softpackConfig) {
    if (softpackConfig.BUILD) {
      console.log("finished build process")
    } else {
      console.log("server ready")
    }
  },
  src: 'src',
  dist: 'dist',
  rootPath: process.cwd(),
  ignore: [
    /** 
     * add files / directories to ignore
     * use glob or regEx
     */
  ],
  socketCallbacks: {
    /** 
     * use socket.emit('log', 'myMsg') in frontend ( for example to debug mobile device )
     * will only work if socketLoad is enabled on template
     */
    log: function (msg) {
      console.log(msg)
    }
  },
  log: {
    /**
     * set log output
     */
    change: true,
    serve: true,
    add: true,
    delete: true,
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
        sass.render,
        sass.prefix
      ]
    },
    {
      test: "**/*.js",
      bundleName: "js/main.js",
      renderEach: [
        js.render
      ]
    },
    {
      test: "**/*.html",
      fileName: "[path]/[name].html",
      socketLoad: true,
      render: [
        hbs.render
      ]
    }
  ]
}