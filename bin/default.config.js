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
  actions: []
}