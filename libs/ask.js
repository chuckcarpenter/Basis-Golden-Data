'use strict';

var rl = require('readline');

module.exports = function ask(question, callback) {
    var r = rl.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    r.question(question + '\n', function (answer) {
        r.close();
        callback(answer);
    });
};
