const ts = require("typescript");
const fs = require("fs");
const path = require("path");
const utils = require("../utils");
const {
    setGlobalModule
} = require("./setBunCode");
const rm = require('rimraf');
const chokidar = require('chokidar');
const chalk = require('chalk')

function compile(fileNames, options) {
    let program = ts.createProgram(fileNames, options);
    let emitResult = program.emit();

    let allDiagnostics = ts
        .getPreEmitDiagnostics(program)
        .concat(emitResult.diagnostics);

    allDiagnostics.forEach(diagnostic => {
        if (diagnostic.file) {
            let {
                line,
                character
            } = diagnostic.file.getLineAndCharacterOfPosition(
                diagnostic.start
            );
            let message = ts.flattenDiagnosticMessageText(
                diagnostic.messageText,
                "\n"
            );
            console.log(
                `${diagnostic.file.fileName.replace('/.cache/', '/server/')} (${line + 1},${character + 1}): ${message}`
            );
        } else {
            console.log(
                `${ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")}`
            );
        }
    });

    let exitCode = emitResult.emitSkipped ? 1 : 0;
    console.log(`Process exiting with code '${exitCode}'.`);
    if (allDiagnostics.length > 0) {
        process.exit();
    }
}

function copyDir(src, dist, ignore) {
    if (!utils.fsExistsSync(dist)) {
        fs.mkdirSync(dist);
    }
    let paths = fs.readdirSync(src);

    paths.forEach(function (path) {
        if (ignore.includes(path)) {
            return;
        }
        var _src = src + '/' + path;
        var _dist = dist + '/' + path;
        let stat = fs.lstatSync(_src);
        if (stat.isDirectory()) {
            // 当是目录，递归复制
            copyDir(_src, _dist, ignore)
        } else {
            fs.writeFileSync(_dist, fs.readFileSync(_src, 'utf8'));
        }
    })
}

function getFileList(rootDir, excludes, userConf) {
    let res = [];
    excludes = excludes.map(item => {
        return item.replace(/[\.]*\//g, '');
    });
    rm.sync('./.cache');
    // 将要转换的目录暂存在cache文件夹下
    copyDir(rootDir, './.cache', excludes);
    let cacheDir = path.resolve(userConf.dirname, './.cache');
    _trans();
    return res;

    function _trans(source) {
        const _src = source ? source : cacheDir;
        let paths = fs.readdirSync(_src);

        paths.forEach(function (path) {
            let target = _src + '/' + path;
            let stat = fs.lstatSync(target);
            if (stat.isDirectory()) {
                if (excludes.includes(path)) {
                    // 过滤excludes
                    return;
                }
                // 当是目录，递归复制
                _trans(target);
            } else {
                if (utils.ists(target)) {
                    // 替换
                    if (userConf.isbun) {
                        //新建一个cache目录暂存改变后的文件   
                        setGlobalModule(target, cacheDir, userConf);
                    }

                    res.push(target);
                }
            }
        })
    }
}

function replaceSourceMapDir(targetText, text, outDir) {
    const regExp = new RegExp(targetText.replace(/\./g, '\\.') + '\\/', 'g');
    _trans();

    function _trans(source) {
        const _src = source ? source : outDir;
        let paths = fs.readdirSync(_src);

        paths.forEach(function (path) {
            let target = _src + '/' + path;
            let stat = fs.lstatSync(target);
            if (stat.isDirectory()) {
                // 当是目录，递归遍历
                _trans(target);
            } else {
                if (utils.isMap(target)) {
                    // 替换
                    fs.writeFileSync(target, fs.readFileSync(target, 'utf8').replace(regExp, text + '/'));
                }
            }
        })
    }
}

exports.compileTypescript = function (userConf, watch, cb) {
    rm.sync('./.cache');
    let tsConfigPath = !userConf.entry ? userConf.dirname : path.resolve(userConf.dirname, 'server');
    let tsConfig = fs.readFileSync(path.resolve(tsConfigPath, 'tsconfig.json'), 'utf8');
    tsConfig = tsConfig.toString();
    const reg = /("([^\\\"]*(\\.)?)*")|('([^\\\']*(\\.)?)*')|(\/{2,}.*?(\r|\n))|(\/\*(\n|.)*?\*\/)/g;
    tsConfig = tsConfig.replace(reg, function (word) { // 去除注释后的文本
        return /^\/{2,}/.test(word) || /^\/\*/.test(word) ? "" : word;
    });
    tsConfig = JSON.parse(tsConfig);

    _compileStartFuc();
    
    
    function _compileStartFuc () {
        tsConfig.include.forEach(include => {
            let rootDir = path.resolve(tsConfigPath, include);
            const fileList = getFileList(rootDir, tsConfig.exclude, userConf);
            // console.log(fileList);
            tsConfig.compilerOptions.rootDir = './.cache';
            tsConfig.compilerOptions.outDir = path.resolve(userConf.dirname, './build');
            compile(fileList, tsConfig.compilerOptions);
            rm.sync('./.cache');
            if (tsConfig.compilerOptions.sourceMap) {
                replaceSourceMapDir('.cache', 'server', path.resolve(tsConfigPath, tsConfig.compilerOptions.outDir));
            }
            console.log(chalk.green(`Ts 文件编译完成`));
        });
        if (watch) {
            // 使用chokidar监控app文件变化，自动部署，仅限线下调试使用
            const watcher = chokidar.watch(tsConfig.include.map(include => path.resolve(tsConfigPath, include)));
            watcher.on('change', (path, stats) => {
                if (stats) console.log(chalk.green(`File ${path} changed size to ${stats.size}`));
                _compileStartFuc();
                cb && cb();
            });
        }
    }
}
// compile(['./test/index.ts', './test/src/index.ts', './test/interface.d.ts'], {
//     experimentalDecorators: true,
//     emitDecoratorMetadata: true,
//     noImplicitAny: true,
//     removeComments: true,
//     sourceMap: true,
//     rootDir: './test',
//     outDir: './dist',
//     noEmitOnError: true,
//     noImplicitAny: true,
//     target: "ES2017",
//     module: "commonjs"
// });