module.exports = (userConf) => {
    const webpack = require('webpack');
    const WebpackBundleSizeAnalyzerPlugin = require('webpack-bundle-size-analyzer').WebpackBundleSizeAnalyzerPlugin;
    const MiniCssExtractPlugin = require("mini-css-extract-plugin");
    const ManifestPlugin = require('webpack-manifest-plugin');

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
        module: { // 在配置文件里添加JSON loader
            rules: [
                {
                    test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf)$/,
                    use: {
                        loader: 'url-loader',
                        options:{
                            limit: 5*1024,
                            name:'img/[name].[ext]',
                            // outputPath: userConf.dirname + `/build/static/${appname}/img`
                            publicPath: userConf.localStaticDomain + `/${appname}`
                        }
                    }
                }
            ]
        },
        optimization: {
            minimize: false
        },
        plugins: [
            new ManifestPlugin({
                writeToFileEmit: true,
                publicPath: userConf.localStaticDomain + `/${appname}/`
            }),
            new WebpackBundleSizeAnalyzerPlugin(userConf.dirname + '/plain-report.txt'),
            new MiniCssExtractPlugin({
                filename: "css/[name].css",
                chunkFilename: "css/[name].chunk.css"
            }),
        ]
    });
}
