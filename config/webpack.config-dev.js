module.exports = (userConf) => {
    const webpack = require('webpack');
    const WebpackBundleSizeAnalyzerPlugin = require('webpack-bundle-size-analyzer').WebpackBundleSizeAnalyzerPlugin;
    const MiniCssExtractPlugin = require("mini-css-extract-plugin");
    const ManifestPlugin = require('webpack-manifest-plugin');
    const CopyWebpackPlugin = require('copy-webpack-plugin');
    
    const appname = userConf.appname; 
    const merge = require('webpack-merge');
    const base = require('./webpack.base.config.js')(userConf);
    const path = require('path');
    const config = require('./config');

    if (userConf.hotMiddleware) {
        Object.keys(base.entry).forEach(function(name) {
            let hotMiddlewareScript = 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true';
            base.entry[name] = [hotMiddlewareScript, base.entry[name]];
        });
    }

    let plugins = [];
    if (userConf.definePlugin && userConf.definePlugin.dev) {
        plugins.push(new webpack.DefinePlugin(userConf.definePlugin.dev));
    }
    if (userConf.manifest || userConf.isbun) {
        plugins.push(new ManifestPlugin({
            writeToFileEmit: true,
            // publicPath: userConf.localStaticDomain + `/${appname}/`
        }));
    }
    const webpackConfig = merge(base, {
        devtool: '#cheap-module-eval-source-map',
        mode: 'development',// development || production
        output: {
            publicPath: userConf.isbun ? userConf.localStaticDomain + `/${appname}/` : userConf.localStaticDomain,
            filename: "js/[name].js",
            chunkFilename: "js/[name].chunk.js",
        },
        module: { // 在配置文件里添加JSON loader
            rules: [
                {
                    test: /\.(png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$/,
                    use: [{
                        loader: 'url-loader',
                        options:{
                            limit: 5*1024,
                            name:'img/[name].[ext]',
                            // outputPath: userConf.dirname + `/build/static/${appname}/img`
                            // publicPath: userConf.localStaticDomain + `/${appname}`
                        }
                    }]
                }
            ]
        },
        optimization: {
            minimize: false
        },
        plugins: [
            new webpack.HotModuleReplacementPlugin({
                multiStep: true,
            }),
            new WebpackBundleSizeAnalyzerPlugin(userConf.dirname + '/plain-report.txt'),
            new MiniCssExtractPlugin({
                filename: "css/[name].css",
                chunkFilename: "css/[name].chunk.css"
            }),
        ].concat(plugins)
    });
    if (userConf.configureWebpack && typeof userConf.configureWebpack === 'function') {
        return userConf.configureWebpack(webpackConfig);
    }
    return webpackConfig;
}
