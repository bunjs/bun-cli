module.exports = (userConf) => {
    const webpack = require('webpack');
    const nodeExternals = require('webpack-node-externals');
    const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');
    const appname = userConf.appname;
    const path = require('path');
    const VueLoaderPlugin = require('vue-loader/lib/plugin');

    let plugins = [];
    if (userConf.definePlugin && userConf.definePlugin.dev) {
        plugins.push(new webpack.DefinePlugin(userConf.definePlugin.dev));
    }
    
    let alias = {};
    for (let [k, v] of Object.entries(userConf.globalPath)) {
        alias[k] = path.resolve(userConf.dirname, v);
    }

    let webpackConfig = {
        mode: 'production',// development || production
        entry: userConf.serverEntry,
        output: {
        	// 此处告知 server bundle 使用 Node 风格导出模块(Node-style exports)
        	libraryTarget: 'commonjs2',
            publicPath: userConf.isbun ? userConf.publicStaticDomain + `/static/${appname}/` : userConf.publicStaticDomain,
            path: path.resolve(userConf.dirname, userConf.output, userConf.isbun ? userConf.appname : ''),
            // path: userConf.dirname + `/build/static/${appname}`,
            filename: "js/server-bundle.min_[chunkhash:8].js",
        },
        resolve:{
            modules: [path.resolve(userConf.dirname, '/src'), 'node_modules'],
            extensions: ['.js', '.vue', '.jsx', '.json'],
            alias: Object.assign({
                'vue$': 'vue/dist/vue.min.js',
                Src: path.resolve(userConf.dirname, '/src/')
            }, alias)
        },
        // 这允许 webpack 以 Node 适用方式(Node-appropriate fashion)处理动态导入(dynamic import)，
		// 并且还会在编译 Vue 组件时，
		// 告知 `vue-loader` 输送面向服务器代码(server-oriented code)。
		target: 'node',
		// https://webpack.js.org/configuration/externals/#function
		// https://github.com/liady/webpack-node-externals
		// 外置化应用程序依赖模块。可以使服务器构建速度更快，
		// 并生成较小的 bundle 文件。
		externals: nodeExternals({
		    // 不要外置化 webpack 需要处理的依赖模块。
		    // 你可以在这里添加更多的文件类型。例如，未处理 *.vue 原始文件，
		    // 你还应该将修改 `global`（例如 polyfill）的依赖模块列入白名单
		    whitelist: [/\.css$/]
		}),
        module: { // 在配置文件里添加JSON loader
            rules: [
                {
                    test: /\.js$/,
                    // exclude: /node_modules/,
                    exclude: file => (
                        /node_modules/.test(file) &&
                        !/\.vue\.js/.test(file)
                    ),
                    use: [
                        {
                            loader: 'babel-loader'
                        }
                    ]
                },
                {
                    test: /\.less$/,
                    use: [
                        // 'vue-style-loader',
                        'null-loader',
                    ]
                },
                {
                    test: /\.css$/,
                    use: [
                        // 'vue-style-loader',
                        'null-loader',
                    ]
                },
                {
                    test: /\.json$/,
                    type: 'javascript/auto',
                    use: [
                        {
                            loader: 'json-loader'
                        }
                    ]
                },
                {
                    test: /\.vue$/,
                    use: [
                        {
                            loader: "vue-loader",
                        }
                    ],
                },
                {
                    test: /\.pug$/,
                    use: [
                        {
                            loader: "pug-plain-loader",
                        }
                    ],
                },
                {
                    test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf)$/,
                    use: [
                        {
                            loader: 'url-loader',
                            options:{
                                limit: 5*1024,
                                name:'img/[name].[hash:7].[ext]',
                                // publicPath: userConf.publicStaticDomain + `/static/${appname}`
                            }
                        }
                    ]
                }
            ]
        },
        optimization: {
            splitChunks: false
        },
        plugins: [
            new VueLoaderPlugin(),
        	// 这是将服务器的整个输出
			// 构建为单个 JSON 文件的插件。
			// 默认文件名为 `vue-ssr-server-bundle.json`
            new VueSSRServerPlugin(),
            // new MiniCssExtractPlugin({
            //     filename: "css/[name].[contenthash:12].css",
            //     chunkFilename: "css/[name].chunk.[contenthash:12].css"
            // }),
        ].concat(plugins)
    };
    return webpackConfig;
}
