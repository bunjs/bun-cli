const config = require('../../config/config.js');
const prompt = require('co-prompt');
const co = require('co');
const chalk = require('chalk');
const download = require("download-git-repo");
const rm = require('rimraf');
const fs = require('fs');

module.exports = (option) => {
    co(function* () {
        let appName = yield prompt(option + ' name: ');
        let fileMap = config[option].fileMap(appName);
        let downloadPath = config[option].downloadPath;
        initFiles(downloadPath, appName, fileMap);
    });
}

function initFiles(downLoadPath, appName, fileMap) {
    console.log(chalk.white('\n Start generating...'));
    download(downLoadPath, './' + appName, function (err) {
        if (err) {
            console.log(err)
            process.exit()
        }
        console.log(chalk.white('\n download file completed!'));
        rm(appName + '/.git', err => {
            if (err) {
                throw err;
            }
            console.log(chalk.white('\n remove .git completed!'));
            try {
                for (let i = 0; i < fileMap.length; i++) {
                    if (fsExistsSync(fileMap[i])) {
                        let text = fs.readFileSync(fileMap[i], 'utf-8');
                        text = text.replace(/\$_appname/g, appName);
                        fs.writeFileSync(fileMap[i], text);
                    }
                }
                console.log(chalk.white('\n replace file completed!'));
                console.log(chalk.green('\n √ Generation completed!'))
                console.log(`\n cd ${appName} && npm install \n`)
                process.exit()
            } catch (e) {
                console.log(e)
                process.exit()
            }
        });
    })
}