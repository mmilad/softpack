var path = require('path');

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
  rootPath: path.resolve(__dirname),
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
    /**
     * your config
     */
    {
      test: '**/*.html', // glob or regEx
      init: [
        /**
         * will execute all on file add / change
         */
        function (context, object, softpackConfig) {
          console.log(object.fileName, 'was added / changed')
        }
      ],
      socketLoad: true, // will add script tag to load socket.io 
      render: [
        /**
         * will execute all if file is requested
         */
        function (context, object, softpackConfig) {
          /**
           * manipulate context
           */
          return context;
        }
      ]
      /** 
       * see docs for more information
       */
    }
  ]
}