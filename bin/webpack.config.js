module.exports = (userConf) => {
    const webpack = require('webpack');
    const MiniCssExtractPlugin = require("mini-css-extract-plugin");

    const appname = userConf.appname; 
    const merge = require('webpack-merge');
    const base = require('./webpack.base.config.js')(userConf);
    return merge(base, {
        mode: 'production',// development || production
        output: {
            path: userConf.dirname + `/build/static/${appname}`,
            filename: "js/[name].min_[chunkhash:8].js",
            chunkFilename: "js/[name].chunk.min_[chunkhash:8].js"
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: "css/[name].[contenthash:12].css",
                chunkFilename: "css/[name].chunk.[contenthash:12].css"
            }),
        ]
    });
}
