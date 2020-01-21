const fs = require('fs');
const pm2 = require('pm2');
const chalk = require('chalk');

function fsExistsSync(path) {
    try {
        fs.accessSync(path, fs.F_OK);
    } catch (e) {
        return false;
    }
    return true;
}

function ists(filename) {
    // 判断文件后缀
    const pos = filename.lastIndexOf('.');
    if (pos === -1) {
        return false;
    }
    const filePrefix = filename.substr(0, pos);
    const filePostfix = filename.substr(pos + 1);
    if (filePrefix.length < 1 || filePostfix.length < 1 || filePostfix !== 'ts') {
        return false;
    }
    return true;
};

function isMap(filename) {
    // 判断文件后缀
    const pos = filename.lastIndexOf('.');
    if (pos === -1) {
        return false;
    }
    const filePrefix = filename.substr(0, pos);
    const filePostfix = filename.substr(pos + 1);
    if (filePrefix.length < 1 || filePostfix.length < 1 || filePostfix !== 'map') {
        return false;
    }
    return true;
};

function restartApp(app, cb) {
    pm2.connect(function (err) {
        if (err) {
            console.error(err);
            process.exit(2);
        }
        pm2.describe(app, (err, processDescription) => {
            // 检查此进程是否在pm2的队列中
            if (processDescription.length === 0) {
                process.exit();
                return;
            }
            pm2.restart(app, function (err, apps) {
                pm2.disconnect(); // Disconnects from PM2
                if (err) {
                    throw err;
                    process.exit()
                }
                console.log(chalk.green('\n √ Restart completed!'));
                if (cb && typeof cb === 'function') {
                    cb();
                }
            });
        });
    });
}


module.exports = {
    ists,
    isMap,
    fsExistsSync,
    restartApp,
}