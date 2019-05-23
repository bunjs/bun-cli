module.exports = (userConf) => {
    const webpack = require('webpack');
    const MiniCssExtractPlugin = require("mini-css-extract-plugin");

    const appname = userConf.appname; 
    const merge = require('webpack-merge');
    const base = require('./webpack.base.config.js')(userConf);
    return merge(base, {
        devtool: '#cheap-module-eval-source-map',
        mode: 'development',// development || production
        output: {
            path: userConf.dirname + `/build/static/${appname}`,
            filename: "js/[name].js",
            chunkFilename: "js/[name].chunk.js",
        },
        optimization: {
            minimize: false
        },
        plugins: [
            new WebpackBundleSizeAnalyzerPlugin(userConf.dirname + '/plain-report.txt'),
            new MiniCssExtractPlugin({
                filename: "css/[name].css",
                chunkFilename: "css/[name].chunk.css"
            }),
        ]
    });
}
