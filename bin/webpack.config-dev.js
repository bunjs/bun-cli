module.exports = (userConf) => {
    const webpack = require('webpack');
    const CopyWebpackPlugin = require('copy-webpack-plugin');
    const WebpackBundleSizeAnalyzerPlugin = require('webpack-bundle-size-analyzer').WebpackBundleSizeAnalyzerPlugin;
    const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
    const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
    const MiniCssExtractPlugin = require("mini-css-extract-plugin");
    const ManifestPlugin = require('webpack-manifest-plugin');
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
        if (userConf.libs) {
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
                            name:'[path][name].[ext]',
                            outputPath: userConf.dirname + `/build/static/${appname}/img`
                        }
                    }
                }

            ].concat(rules)
        },
        optimization: {
            minimize: false, //生成模式默认开启
        },
        plugins: [
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
                chunkFilename: "css/[id].css"
            }),
        ]

    }
}
