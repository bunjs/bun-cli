module.exports = (userConf) => {
	process.env.NODE_ENV = 'dev';

	var opn = require('opn');
	var path = require('path');
	var express = require('express');
	var webpack = require('webpack');
	const history = require('connect-history-api-fallback');
	// var proxyMiddleware = require('http-proxy-middleware');
	// var mockServerMiddleware = require('./mockServerMiddleware');
	// var proxyServerMiddleware = require('./proxyServerMiddleware');
	var webpackConfig = require('../config/webpack.config-dev.js')(userConf);
	if (!userConf.dev) {
		console.log('Can not found config.dev!');
		process.exit();
	}
	// default port where dev server listens for incoming traffic
	var port = process.env.PORT || userConf.dev.port;
	// automatically open browser, if not set will be false
	var autoOpenBrowser = !!userConf.dev.autoOpenBrowser;
	// Define HTTP proxies to your custom API backend
	// https://github.com/chimurai/http-proxy-middleware
	var proxyTable = userConf.dev.proxyTable;

	var app = express();
	var compiler = webpack(webpackConfig);

	var devMiddleware = require('webpack-dev-middleware')(compiler, {
	    publicPath: '/',
	    quiet: true,
	    stats: {
            assets: true,
            colors: true,
            publicPath: true,
            version: true,
            hash: false,
            timings: false,
            chunks: false,
            children: false,
            chunkOrigins: false,
            chunkModules: false,
            depth: false,
            modules: false,
        },
	});


	var hotMiddleware = require('webpack-hot-middleware')(compiler, {
	    log: false,
	    heartbeat: 2000,
	});
	app.use(
	    history({
	        index: '/index.html'
	    })
	);
	// // proxy api requests
	// Object.keys(proxyTable).forEach(function (context) {
	//   var options = proxyTable[context]
	//   if (typeof options === 'string') {
	//     options = { target: options }
	//   }
	//   app.use(proxyMiddleware(options.filter || context, options))
	// })

	// serve webpack bundle output
	app.use(devMiddleware);

	// enable hot-reload and state-preserving
	// compilation error display
	app.use(hotMiddleware);

	// if (process.env.SERVER_ENV === 'mock') {
	//   app.use(mockServerMiddleware);
	// } else {
	//   app.use(proxyServerMiddleware);
	// }

	// mock & proxy server
	app.use(
	    require('express-devtool')({
	        mockDir: path.resolve(process.cwd(), userConf.dev.mockDir), // 定义mock目录
	    })
	);

	// serve pure static assets
	// var staticPath = path.posix.join(userConf.dev.assetsPublicPath, userConf.dev.assetsSubDirectory);
	app.use(express.static(webpackConfig.output.path));

	var uri = 'http://localhost:' + port + userConf.dev.openUrlPath;

	var _resolve;
	var readyPromise = new Promise(resolve => {
	    _resolve = resolve;
	});

	console.log('> Starting dev server...');
	devMiddleware.waitUntilValid(() => {
	    console.log('> Listening at ' + uri + '\n');
	    // when env is testing, don't need open it
	    if (autoOpenBrowser) {
	        opn(uri);
	    }
	    _resolve();
	});

	var server = app.listen(port);

	module.exports = {
	    ready: readyPromise,
	    close: () => {
	        server.close();
	    },
	};

}
