module.exports = (userConf) => {
    const webpack = require('webpack');
    const MiniCssExtractPlugin = require("mini-css-extract-plugin");
    const ManifestPlugin = require('webpack-manifest-plugin');
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
        module: { // 在配置文件里添加JSON loader
            rules: [
                {
                    test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf)$/,
                    use: {
                        loader: 'url-loader',
                        options:{
                            limit: 5*1024,
                            name:'img/[name].[hash:7].[ext]',
                            publicPath: userConf.publicStaticDomain + `/static/${appname}`
                        }
                    }
                }
            ]
        },
        plugins: [
            new ManifestPlugin({
                writeToFileEmit: true,
                publicPath: userConf.publicStaticDomain + `/static/${appname}/`
            }),
            new MiniCssExtractPlugin({
                filename: "css/[name].[contenthash:12].css",
                chunkFilename: "css/[name].chunk.[contenthash:12].css"
            }),
        ]
    });
}
