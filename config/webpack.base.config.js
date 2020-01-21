module.exports = (userConf) => {
    const webpack = require('webpack');
    const CopyWebpackPlugin = require('copy-webpack-plugin');
    const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
    const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
    const MiniCssExtractPlugin = require("mini-css-extract-plugin");
    const autoprefixer = require('autoprefixer');
    const HtmlWebpackPlugin = require('html-webpack-plugin');

    const utils = require('../utils');
    const config = require('./config');

    const path = require('path');
    const fs = require('fs');

    const appname = userConf.appname;

    //选择entry目录下的所有文件
    const opts = (function () {
        let obj = {}
        let htmlplugins = [];
        // let files = fs.readdirSync(path.resolve(userConf.dirname, './src/entry'));

        for (let name in userConf.entry) {
            obj[name.split('.')[0]] = path.resolve(userConf.dirname, userConf.entry[name]);
            // HtmlWebpackPlugin只在非bun模式下开启
            if (userConf.template && !userConf.isbun) {
                htmlplugins.push(new HtmlWebpackPlugin({
                    // filename: name + '.html',
                    template: userConf.template,
                    inject: true,
                    minify: {
                        removeComments: true,
                        collapseWhitespace: true,
                        removeAttributeQuotes: true,
                        // more options:
                        // https://github.com/kangax/html-minifier#options-quick-reference
                    }
                }));
            }
        }

        return {
            entries: obj,
            htmlplugins: htmlplugins
        };
    })();


    const map = {
        jsx: {
            test: /\.jsx$/,
            // exclude: /node_modules/,
            exclude: file => (
                /node_modules/.test(file) &&
                !/\.vue\.js/.test(file)
            ),
            use: [{
                loader: 'babel-loader',
                options: {
                    configFile: path.resolve(userConf.dirname, userConf.isbun ? './client/babel.config.js' : './babel.config.js')
                }
            }]
        },
        tsx: {
            test: /\.tsx$/,
            // exclude: /node_modules/,
            exclude: file => (
                /node_modules/.test(file) &&
                !/\.vue\.js/.test(file)
            ),
            use: [{
                loader: 'babel-loader',
                options: {
                    configFile: path.resolve(userConf.dirname, userConf.isbun ? './client/babel.config.js' : './babel.config.js')
                }
            }]
        },
        less: {
            test: /\.less$/,
            use: [
                MiniCssExtractPlugin.loader,
                {
                    loader: 'css-loader',
                },
                {
                    loader: 'postcss-loader',
                    options: {
                        ident: 'postcss',
                        plugins: [autoprefixer({
                            browsers: ['last 2 versions', 'Android >= 4.0', 'iOS 7'],
                        })]
                    }
                },
                {
                    loader: 'less-loader',
                },
                {
                    loader: 'style-resources-loader',
                    options: {
                        injector: 'prepend',
                        patterns: (userConf.globalStyle && userConf.globalStyle.length) ? userConf.globalStyle.map((val) => path.resolve(userConf.dirname, val)) : '',
                        // path.resolve(userConf.dirname, 'src/resource/style/public.less'),
                        // path.resolve(userConf.dirname, 'src/resource/style/theme.less')
                    }
                },
            ]
        },
        vue: {
            test: /\.vue$/,
            use: [{
                loader: "vue-loader",
            }],

        },
        pug: {
            test: /\.pug$/,
            use: [{
                loader: "pug-plain-loader",
            }],
        },
    }

    let rules = [];
    for (let i = 0; i < userConf.supportFileType.length; i++) {
        if (map[userConf.supportFileType[i]]) {
            rules.push(map[userConf.supportFileType[i]]);
        }
    }
    let plugins = [];
    for (let i = 0; i < userConf.supportFileType.length; i++) {
        if (userConf.supportFileType[i] === 'vue') {
            const VueLoaderPlugin = require('vue-loader/lib/plugin');
            plugins.push(new VueLoaderPlugin());
            // vuessr 生成`vue-ssr-client-manifest.json`。
            if (userConf.ssr) {
                const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');
                plugins.push(new VueSSRClientPlugin());
            }
        }
    }
    if (opts.htmlplugins.length > 0) {
        plugins = plugins.concat(opts.htmlplugins);
    }
    // bun模式下拷贝指定目录
    let webpackCopyConf = [];
    if (userConf.isbun) {
        let wcc = userConf.isSingle ?
            config.webpackCopyConf(userConf._appPath) :
            config.unsingleWebpackCopyConf(userConf._appPath);
        let buildStaticPath = `./build/static${userConf._appPath}`;
        if (userConf.staticPath) {
            wcc[userConf.staticPath] = buildStaticPath;
        } else {
            wcc['./client/static'] = buildStaticPath;
        }
        for (let i in wcc) {
            webpackCopyConf.push({
                from: path.resolve(userConf.dirname, i),
                to: path.resolve(userConf.dirname, wcc[i]),
                ignore: ['.*']
            })
        }
    }
    plugins = plugins.concat([new CopyWebpackPlugin(webpackCopyConf)]);

    let alias = {};
    for (let [k, v] of Object.entries(userConf.globalPath)) {
        alias[k] = path.resolve(userConf.dirname, v);
    }
    if (userConf.supportFileType.includes('vue')) {
        alias['vue$'] = 'vue/dist/vue.min.js';
    }

    return {
        entry: opts.entries,
        output: {
            path: path.resolve(userConf.dirname, userConf.output, userConf.isbun ? (userConf.isSingle ? '' : appname) : ''),
        },
        resolve: {
            modules: [path.resolve(userConf.dirname, '/client'), 'node_modules'],
            extensions: ['.ts', '.tsx', '.js', '.vue', '.jsx', '.json'],
            alias: Object.assign({
                Src: path.resolve(userConf.dirname, '/client/')
            }, alias)
        },
        module: { // 在配置文件里添加JSON loader
            rules: [{
                    test: /\.(ts|js)$/,
                    // exclude: /node_modules/,
                    exclude: file => (
                        /node_modules/.test(file) &&
                        !/\.vue\.js/.test(file)
                    ),
                    use: [{
                        loader: 'babel-loader',
                        options: {
                            configFile: path.resolve(userConf.dirname, userConf.isbun ? './client/babel.config.js' : './babel.config.js')
                        }
                    }]
                },
                {
                    test: /\.json$/,
                    type: 'javascript/auto',
                    use: [{
                        loader: 'json-loader'
                    }]
                },
                {
                    test: /\.css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                ident: 'postcss',
                                plugins: [autoprefixer({
                                    browsers: ['last 2 versions', 'Android >= 4.0', 'iOS 7'],
                                })]
                            }
                        }
                    ]
                },
            ].concat(rules)
        },
        optimization: {
            minimizer: (function () {
                let res = [];
                if (userConf.uglifyJs) {
                    res.push(new UglifyJsPlugin({
                        cache: true,
                        parallel: true,
                        sourceMap: false
                    }));
                }
                if (userConf.optimizeCSS) {
                    res.push(new OptimizeCSSAssetsPlugin({}));
                }
                if (res.length < 1) {
                    return false;
                }
                return res;
            })(),
            splitChunks: {
                chunks: 'async',
                minSize: 30000,
                minChunks: 1,
                maxAsyncRequests: 5,
                maxInitialRequests: 3,
                automaticNameDelimiter: '_',
                name: true,
                cacheGroups: (function () {
                    let libsReg = '';
                    if (userConf.libs && userConf.libs.length > 0) {
                        libsReg = new RegExp('[\\/]node_modules[\\/](' + userConf.libs.join('|') + ')', 'ig');
                    } else {
                        libsReg = new RegExp('[\\/]node_modules[\\/]', 'ig');
                    }

                    let cg = {
                        // 所有libs的模块打包
                        libs: {
                            test: libsReg,
                            name: "libs",
                            chunks: "initial",
                            priority: 1
                        },
                        // 入口引入超过2次的代码
                        commons: {
                            test: /\.js/,
                            name: "commons",
                            chunks: "initial",
                            minChunks: 2,
                            reuseExistingChunk: true,
                            priority: -20
                        },
                        // 所有node_modules的模块打包
                        vendors: {
                            test: /[\\/]node_modules[\\/]/,
                            name: "vendors",
                            chunks: "initial",
                            priority: -10
                        }
                    }
                    if (!userConf.cacheGroups || userConf.cacheGroups.length <= 0) {
                        userConf.cacheGroups = ['vendors', 'commons'];
                    }
                    let res = {};
                    if (Array.isArray(userConf.cacheGroups)) {
                        for (let i = 0; i < userConf.cacheGroups.length; i++) {
                            res[userConf.cacheGroups[i]] = cg[userConf.cacheGroups[i]];
                        }
                    } else {
                        res[userConf.cacheGroups] = cg[userConf.cacheGroups];
                    }
                    return res;
                })()
            }
        },
        plugins: [
            new webpack.NamedModulesPlugin(),
            new webpack.NoEmitOnErrorsPlugin(),
            new webpack.HashedModuleIdsPlugin(),
        ].concat(plugins)

    }
}