module.exports = (userConf) => {
    const webpack = require('webpack');
    const CopyWebpackPlugin = require('copy-webpack-plugin');
    const WebpackBundleSizeAnalyzerPlugin = require('webpack-bundle-size-analyzer').WebpackBundleSizeAnalyzerPlugin;
    const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
    const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
    const MiniCssExtractPlugin = require("mini-css-extract-plugin");
    const ManifestPlugin = require('webpack-manifest-plugin');
    // const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
    // var ExtractTextPlugin = require("extract-text-webpack-plugin");// webpack4暂不支持
    const autoprefixer = require('autoprefixer');

    const path = require('path');
    const fs = require('fs');

    const appname = userConf.appname; 

    //选择entry目录下的所有文件
    let opts = (function () {
        var obj = {}
        var htmlplugins = [];
        var files = fs.readdirSync(path.resolve(userConf.dirname, './src/entry'));

        // npm公共模块
        if (userConf.libs && userConf.libs.length > 0) {
            obj['libs'] = userConf.libs;
        }

        files.forEach(function (name, index) {
            var stat = fs.statSync(path.resolve(userConf.dirname, './src/entry', name));
            if (!stat.isDirectory()) {
                obj[name.split('.')[0]] = path.resolve(userConf.dirname, './src/entry', name);
            }
        })
        return {
            entries: obj,
            htmlplugins: htmlplugins
        };
    })();
    let map = {
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
                }
            ]
        },
        vue: {
            test: /\.vue$/,
            use: ["vue-loader"]
        }
    }
    let rules = [];
    for (var i = 0; i < userConf.supportFileType.length; i++) {
        if (map[userConf.supportFileType[i]]) {
            rules.push(map[userConf.supportFileType[i]]);
        }
    }

    return {
        devtool: 'cheap-module-eval-source-map',
        mode: 'development',// development || production
        entry: opts.entries,
        output: {
            path: userConf.dirname + `/build/static/${appname}`,
            filename: "js/[name].js",
            chunkFilename: "js/[name].chunk.js",
        },
        resolve:{
            alias:{
                Src: path.resolve(userConf.dirname, '/src/')
            }
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
                
                {
                    test: /\.(png|jpg|jpeg|gif|svg|eot|woff|woff2|ttf)$/,
                    use: {
                        loader: 'url-loader',
                        options:{
                            limit: 5*1024,
                            name:'img/[name].[hash:7].[ext]',
                            // outputPath: 'img/',
                            publicPath: userConf.localStaticDomain + `/${appname}`
                        }
                    }
                }

            ].concat(rules)
        },
        optimization: {
            minimize: false, //生成模式默认开启
            splitChunks: {
                chunks: 'async',// 标识打包块的范围：initial(初始块)、async(按需加载块)、all(全部块)，默认为all
                minSize: 30000, // 压缩前最小模块大小
                minChunks: 1,// 引入次数最少1次
                maxAsyncRequests: 5,// 按需加载时并行请求的最大数量
                maxInitialRequests: 3,// 最大的初始化加载次数
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
                            reuseExistingChunk: true,// 如果满足条件的块已经存在就使用已有的，不再创建一个新的块
                            priority: -10// 表示缓存的优先级
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
            // new BundleAnalyzerPlugin(),
            new ManifestPlugin({
                writeToFileEmit: true,
                publicPath: userConf.localStaticDomain + `/${appname}/`
            }),
            new WebpackBundleSizeAnalyzerPlugin(userConf.dirname + '/plain-report.txt'),
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
                filename: "css/[name].css",
                chunkFilename: "css/[name].chunk.css"
            }),
        ]

    }
}
