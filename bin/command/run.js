const pm2 = require('pm2');

module.exports = () => {
    console.log(chalk.white('\n Starting bunko...'))
    pm2.connect(function (err) {
        if (err) {
            console.error(err);
            process.exit(2);
        }

        pm2.start(process.cwd() + '/ecosystem.config.js', function (err, apps) {
            pm2.disconnect(); // Disconnects from PM2
            if (err) {
                throw err;
                process.exit()
            }
            console.log(chalk.green('\n √ Starting completed!'))
            process.exit()

        });
    });
}