const ts = require("typescript");
const fs = require("fs");
const {
    fsExistsSync,
    ists
} = require("../utils");

function getModuleList(path, keyPath, context, fileName) {

    let key = '';
    if (!fsExistsSync(path)) {
        // 如果必要且找不到对应目录，则报警
        return;
    }
    // const fstat = fs.lstatSync(path);

    // if (fstat.isFile()) {
    //     // 对文件进行直接引入操作
    //     key = getFuncName(path, keyPath);
    //     if (key.split('_').length > 1) {
    //         context[key] = path;
    //     }
    //     return;
    // }

    const files = fs.readdirSync(path);
    files.forEach((filename) => {
        const stat = fs.lstatSync(path + "/" + filename);
        if (stat.isDirectory()) {
            // 是文件夹继续循环
            getModuleList(
                path + "/" + filename,
                keyPath,
                context,
                fileName
            );
            return;
        }

        // 判断文件后缀
        if (!ists(filename)) {
            return;
        }

        key = getFuncName(path + '/' + filename, keyPath);
        if (key.split('_').length <= 1) return;
        filename = filename.split('.')[0];

        function getRelativePath(path, currentPath) {
            const pathArr = path.split('/');
            const currentPathArr = currentPath.split('/');
            let pathArrRes = [...pathArr];
            let currentPathArrRes = [...currentPathArr];
            for (let index = 0; index < currentPathArr.length; index++) {
                if (currentPathArr[index] === pathArr[index]) {
                    pathArrRes[index] = '';
                    currentPathArrRes[index] = '';
                } else {
                    break;
                }
            }
            pathArrRes = pathArrRes.filter(item => !!item);

            currentPathArrRes = currentPathArrRes.filter(item => !!item);
            currentPathArrRes.splice(0, 1);
            currentPathArrRes = currentPathArrRes.map(item => '..');
            // 如果没有值，说明是当前目录
            if (currentPathArrRes.length === 0) {
                currentPathArrRes.push('.');
            }
            return currentPathArrRes.join('/') + '/' + pathArrRes.join('/');
        }
        const relativePath = getRelativePath(path + "/" + filename, fileName);
        context[key] = relativePath;
    });
}

function isPurelyServerApplications(rootDir, fileName) {
    // 处理用户单独使用node，且是多应用模式的情况
    // 如果同时存在/app/appname/action、/app/appname/controller则认为命中这种模式
    const regExp = new RegExp(rootDir.replace(/\//g, '\\/') + '\\/app\\/(.*)?\\/.*');
    if (fileName.match(regExp)) {
        let path = rootDir + '/app/' + RegExp.$1 + '/';
        if (fsExistsSync(path + 'action') && fsExistsSync(path + 'controller')) {
            return RegExp.$1;
        }
        return '';
    }
    return '';
}

function getAppName(rootDir, fileName, userConf) {
    if (userConf.isSingle) {
        return '';
    }
    let res = isPurelyServerApplications(rootDir, fileName);
    if (!res) {
        return userConf.appname;
    }
    return res;
}
/**
 * 拼接方法名
 *
 * 规则：文件全路径-keypath
 * 如：path:app/example/action/api/home, keypath: app/example/
 * 则拼出来的方法名为：BUN_Action_Api_Home
 * @return string
 */
const getFuncName = (path, keypath) => {
    let newpath = path.replace('.ts', "");
    if (keypath === newpath) {
        newpath = "";
    } else {
        newpath = newpath.replace(keypath + "/", "");
    }

    const patharr = newpath.split("/");
    const arr = [];
    for (const item of patharr) {
        if (!item) {
            continue;
        }
        // 首字母大写
        arr.push(item.replace(/^\S/g, (s) => {
            return s.toUpperCase();
        }));
    }
    return arr.join("_");
};

exports.setGlobalModule = function (file, rootDir, userConf) {
    const regExp = new RegExp(rootDir.replace(/\//g, '\\/') + '\\/app\\/.*');
    if (file.match(regExp)) {
        let body = fs.readFileSync(file);
        body = body.toString();
        let appPath = rootDir + '/app';
        let appName = isPurelyServerApplications(rootDir, file);
        if (appName) {
            appPath = appPath + '/' + appName;
        }
        let globalModuleList = {};
        getModuleList(appPath, appPath, globalModuleList, file);
        let currentKey = getFuncName(file, appPath);
        appName = getAppName(rootDir, file, userConf);
        let str = '';
        Object.entries(globalModuleList).forEach(([key, value]) => {
            // 过滤自身名字、已require引入的名字 以及 未引用的名字
            const regExp = new RegExp('(\?\<\!\\/\\/[\\s]*)import[\\s]+' + key);
            if (key === currentKey || body.indexOf(key) === -1 || body.match(regExp)) {
                return;
            }
            str += 'import ' + key + ' = require("' + value + '");\n';
        });
        if (body.indexOf('extends App') !== -1) {
            str += 'const App = bun.app' + (appName ? '.' + appName : '') + '.class;\n';
        }
        fs.writeFileSync(file, str + body);
    }
}