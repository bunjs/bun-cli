module.exports = (userConf) => {
    const webpack = require('webpack');
    const CopyWebpackPlugin = require('copy-webpack-plugin');
    const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
    const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
    const MiniCssExtractPlugin = require("mini-css-extract-plugin");
    const ManifestPlugin = require('webpack-manifest-plugin');
    const autoprefixer = require('autoprefixer');

    const path = require('path');
    const fs = require('fs');

    const appname = userConf.appname; 

    //选择entry目录下的所有文件
    const opts = (function () {
        let obj = {}
        let htmlplugins = [];
        let files = fs.readdirSync(path.resolve(userConf.dirname, './src/entry'));

        files.forEach(function (name, index) {
            let stat = fs.statSync(path.resolve(userConf.dirname, './src/entry', name));
            if (!stat.isDirectory()) {
                obj[name.split('.')[0]] = path.resolve(userConf.dirname, './src/entry', name);
            }
        })
        return {
            entries: obj,
            htmlplugins: htmlplugins
        };
    })();
    const map = {
        jsx: {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: [
                {
                    loader: 'babel-loader'
                }
            ]
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
            ]
        },
        vue: {
            test: /\.vue$/,
            use: ["vue-loader"]
        }
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
        }
    }
    let alias = {};
    for (let [k, v] of Object.entries(userConf.globalPath)) {
        alias[k] = path.resolve(userConf.dirname, v);
    }
    return {
        entry: opts.entries,
        resolve:{
            alias: Object.assign({
                'vue$': 'vue/dist/vue.esm.js',
                Src: path.resolve(userConf.dirname, '/src/')
            }, alias)
        },
        module: { // 在配置文件里添加JSON loader
            rules: [
                {
                    test: /\.js?$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'babel-loader'
                        }
                    ]
                }, 
                {
                    test: /\.json$/,
                    use: [
                        {
                            loader: 'json-loader'
                        }
                    ]
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
                            priority: -20
                        },
                        // 入口引入超过2次的代码
                        commons: {
                            test: /\.js/,
                            name: "commons",
                            chunks: "initial",
                            minChunks: 2,
                            reuseExistingChunk: true,
                            priority: -10
                        },
                        // 所有node_modules的模块打包
                        vendors: {
                            test: /[\\/]node_modules[\\/]/,
                            name: "vendors",
                            chunks: "initial",
                            priority: -20
                        }
                    }
                    
                    let res = {};
                    res[userConf.cacheGroups] = cg[userConf.cacheGroups];
                    return res;
                })()
            }
        },
        plugins: [
            new CopyWebpackPlugin([
                // 切记放在new HtmlWebpackPlugin之前
                {
                   from: path.resolve(userConf.dirname, './server'),
                   to: path.resolve(userConf.dirname, `./build/server/${appname}/`),
                   ignore: ['.*']
                },
                {
                   from: path.resolve(userConf.dirname, './conf'),
                   to: path.resolve(userConf.dirname, `./build/conf/${appname}/`),
                   ignore: ['.*']
                },
                {
                   from: path.resolve(userConf.dirname, './src/template'),
                   to: path.resolve(userConf.dirname, `./build/template/${appname}/`),
                   ignore: ['.*']
                },
                {
                   from: path.resolve(userConf.dirname, './src/static'),
                   to: path.resolve(userConf.dirname, `./build/static/${appname}/`),
                   ignore: ['.*']
                },
                {
                   from: path.resolve(userConf.dirname, './src'),
                   to: path.resolve(userConf.dirname, `./build/src/${appname}/`),
                   ignore: ['.*']
                }
            ]),

            new MiniCssExtractPlugin({
                filename: "css/[name].[contenthash:12].css",
                chunkFilename: "css/[name].chunk.[contenthash:12].css"
            }),
        ].concat(plugins)

    }
}
