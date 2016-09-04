module.exports = function (encrypt) {
    var crypto = require('crypto');
    var md5 = crypto.createHash('md5');
    var password = md5.update(encrypt).digest('base64');
    return password;
}