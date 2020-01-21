module.exports = () => {
    let userConf = require(process.cwd() + '/config.js');
    userConf.hotMiddleware = true;
    require('../../dev-server/server.js')(userConf);
}