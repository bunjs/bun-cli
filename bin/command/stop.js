const pm2 = require('pm2');

module.exports = (app) => {
    pm2.connect(function (err) {
        if (err) {
            console.error(err);
            process.exit(2);
        }

        pm2.stop(app, function (err, apps) {
            pm2.disconnect(); // Disconnects from PM2
            if (err) {
                throw err;
                process.exit()
            }
            console.log(chalk.green('\n √ Stoping completed!'))
            process.exit()

        });
    });
}