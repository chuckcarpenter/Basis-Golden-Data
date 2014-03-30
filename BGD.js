'use strict';

var request = require('request');
var fs = require('fs');
var dateFormat = require('dateformat');
var rl = require('readline');
var chalk = require('chalk');

// example URLs for API
// for some reason, sleep must be submitted different than activities.
//
// https://app.mybasis.com/api/v2/users/me/days/2014-03-1/activities?type=sleep&expand=activities
// https://app.mybasis.com/api/v1/chart/me?summary=true&interval=60&units=ms&start_date=2014-03-01&start_offset=-10800&end_offset=10800&heartrate=true&steps=true&calories=true&gsr=true&skin_temp=true&bodystates=true
// https://app.mybasis.com/api/v2/users/me/days/2014-03-1/activities?type=run,walk,bike&expand=activities


var date = new Date();
var outputFile = 'basis.json';
var usr, psw, access_token, expires;

// If user passed info on start, then we won't ask questions
var checkLogin = function () {
    if (process.argv.length > 2) {
        console.log(chalk.green('Thanks.'));

        usr = process.argv[2];
        psw = process.argv[3];

        return requestUser(usr, psw);
    } else {
        console.log(chalk.red('Please enter username and/or password'));

        ask(chalk.green('What is your Basis username?'), function (answer) {
            usr = answer;

            ask(chalk.green('What is your Basis password?'), function (answer) {
                psw = answer;
                return requestUser(usr, psw);
            });
        });
    }

};

// Thinking about whether this is needed.
// var validateEmail = function (email) {
//     var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//     return re.test(email);
// };

// This provides a generic asking function for user prompts
var ask = function (question, callback) {
    var r = rl.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return r.question(question + '\n', function (answer) {
        r.close();
        callback(answer);
    });
};

var getSleepData = function (date) {
    request.get({
            url: 'https://app.mybasis.com/api/v2/users/me/days/' + date + '/activities?type=sleep&expand=activities',
            jar: access_token,
            json: true
        }, function (e, r, data) {
            if (e) return console.log(e);

            // Now let's save the JSON
            fs.writeFile(outputFile, JSON.stringify(data, null, 4), function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('JSON saved to ' + outputFile);
                }
            });
        }
    );
};

var getToken = function (error, response) {
    if (error) return console.log(error);

    access_token = response.headers['set-cookie'][0].match(/access_token=([0-9a-f]+)/);
    // refresh_token = response.headers['set-cookie'][0].match( /refresh_token=([0-9a-f]+)/ ),
    // expires = response.headers['set-cookie'][0].match(/expires=([0-9a-f]+)/);

    request.get({
        url: 'https://app.mybasis.com/api/v1/user/me.json',
        jar: access_token,
        json: true
    }, function (e, r, user) {
        if (e) return console.log(e);

        ask(chalk.green('Do you want today\'s info?') + chalk.blue(' (Y/N)'), function (answer) {
            var requestDate;
            answer.toLowerCase();

            if (answer === 'y') {
                requestDate = dateFormat(date, 'yyyy-mm-dd');

                getSleepData(requestDate);
            } else {
                ask(chalk.green('Please enter new date.') + chalk.blue(' format: yyyy-mm-dd'), function (answer) {
                    requestDate = answer;

                    getSleepData(requestDate);
                });
            }

        });

    });
};

var requestUser = function (usr, psw) {
    request({
        uri: 'https://app.mybasis.com/login',
        method: 'POST',
        form: {
            username: usr,
            password: psw
        },
        followRedirect: true,
        maxRedirects: 10,
        jar: true
    }, function (e, r, data) {
        if (e) return console.log(e);

        getToken(e, r, data);
    });
};

exports.BGD = checkLogin();
