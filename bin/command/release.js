const chalk = require('chalk')
const fs = require('fs');
const webpack = require("../../node_modules/webpack");
const {
    restartApp,
    fsExistsSync
} = require("../../utils");
const {
    compileTypescript
} = require("../../ts-compile/index");

module.exports = (options) => {
    let path = options.to;
    let dev = options.dev;
    let test = options.test;
    let userConf = require(process.cwd() + '/config.js');
    let isSingle = userConf.isSingle;
    let webpackConfig = '';
    let ssrWebpackConfig = '';
    let appType = userConf.frame;
    userConf._appPath = isSingle ? '/' : `/${userConf.appname}/`;

    if (dev) {
        process.env.NODE_ENV = 'development';
        webpackConfig = require('../../config/webpack.config-dev.js')(userConf);
    } else {
        process.env.NODE_ENV = 'production';
        if (test) {
            userConf.publicStaticDomain = userConf.testStaticDomain;
        }
        webpackConfig = require('../../config/webpack.config.js')(userConf);
    }
    if (userConf.ssr) {
        if (appType === 'vue') {
            ssrWebpackConfig = require('../../config/webpack.config-vuessr.js')(userConf);
        } else if (appType === 'react') {
            ssrWebpackConfig = require('../../config/webpack.config-reactssr.js')(userConf);
        }
    }

    console.log(chalk.white('\n Start deploying...'));
    let projectName = process.cwd().split('/').slice(-1)[0];
    if (path) {
        projectName = path.replace(/.*?\/([/s/S]*)\/?/ig, '$1');
    }

    compileTypescript(userConf, options.watch, () => restartApp(projectName));
    webpackBuild(webpackConfig, options.watch, (stats) => {
        try {
            if (userConf.ssr) {
                webpackBuild(ssrWebpackConfig, false, (stats) => {
                    let projectName = process.cwd().split('/').slice(-1)[0];
                    restartApp(projectName, () => {});
                });
            } else {
                if (path) {
                    moveToProAndWatch();
                }
            }
        } catch (e) {
            console.log(e)
            process.exit()
        }
    });
}

function moveToProAndWatch() {
    // 如果设置to参数，则移动build目录下的文件到指定project
    let files = fs.readdirSync('./build/app/');
    let appName = files[0];
    let fileMap = config.deployConf.fileMap(path);
    moveAppToPro(appName, fileMap);
    let projectName = path.replace(/.*?\/([/s/S]*)\/?/ig, '$1');

    restartApp(projectName, () => {
        if (options.watch) {} else {
            process.exit();
        }
    });
}

function copyDir(src, dist) {
    if (!fsExistsSync(dist)) {
        fs.mkdirSync(dist);
    }
    let paths = fs.readdirSync(src);

    paths.forEach(function (path) {
        var _src = src + '/' + path;
        var _dist = dist + '/' + path;
        let stat = fs.lstatSync(_src);
        if (stat.isDirectory()) {
            // 当是目录，递归复制
            copyDir(_src, _dist)
        } else {
            fs.writeFileSync(_dist, fs.readFileSync(_src));
        }
    })
}

function moveAppToPro(appName, fileMap) {
    for (let i in fileMap) {
        if (fsExistsSync(i + appName)) {
            if (!fsExistsSync(fileMap[i])) {
                fs.mkdirSync(fileMap[i]);
                copyDir(i + appName, fileMap[i] + appName);
            } else {
                copyDir(i + appName, fileMap[i] + appName);
            }
        }
    }
    rm.sync('./build');
    console.log(chalk.white('\n √ Remove build completed!'));
    console.log(chalk.green('\n √ Deploy completed!'));
}

function webpackBuild(webpackConfig, isWatch, cb) {
    const complier = webpack(webpackConfig);
    if (isWatch) {
        complier.watch({}, callback);
    } else {
        complier.run(callback);
    }

    function callback(err, stats) {
        // 在这里处理错误
        if (err) {
            console.error(err.stack || err);
            if (err.details) {
                console.error(err.details);
            }
            process.exit();
        }

        const info = stats.toJson();

        if (stats.hasErrors()) {
            console.error(info.errors);
            // process.exit();
        }

        if (stats.hasWarnings()) {
            console.warn(info.warnings);
        }
        console.log(stats.toString({
            // 增加控制台颜色开关
            colors: true
        }));
        console.log(chalk.green('\n √ Complier completed!'));
        cb(stats);
    }
}