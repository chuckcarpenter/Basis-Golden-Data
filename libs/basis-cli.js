'use strict';

// external libs
var request = require('request');
var fs = require('fs');
var dateFormat = require('dateformat');
var rl = require('readline');
var chalk = require('chalk');

// internal libs
var ask = require('./ask');

// example URLs for API
// for some reason, sleep must be submitted different than activities.
//
// https://app.mybasis.com/api/v2/users/me/days/2014-03-1/activities?type=sleep&expand=activities
// https://app.mybasis.com/api/v1/chart/me?summary=true&interval=60&units=ms&start_date=2014-03-01&start_offset=-10800&end_offset=10800&heartrate=true&steps=true&calories=true&gsr=true&skin_temp=true&bodystates=true
// https://app.mybasis.com/api/v2/users/me/days/2014-03-1/activities?type=run,walk,bike&expand=activities


var date = new Date();
var outputFile = 'basis.json';
var args = process.argv.slice(2);
var usr, psw, access_token, expires;


// Begin by getting the user info, either by checking for args passed or asking on command line.

var checkLogin = function () {
    if (args.length >= 1) {
        var email;
        console.log(chalk.green('Thanks.'));

        for (var i = 0; i < args.length; i++) {
            email = validateEmail(args[i]);

            if (!!email) { usr = args[i]; }

            psw = args[i];
        }

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

var validateEmail = function (email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

var getData = function (date) {
    var url,
        sleep = 'https://app.mybasis.com/api/v2/users/me/days/' + date + '/activities?type=sleep&expand=activities',
        activities = 'https://app.mybasis.com/api/v2/users/me/days/' + date + '/activities?type=run,walk,bike&expand=activities',
        details = 'https://app.mybasis.com/api/v1/chart/me?summary=true&interval=60&units=ms&start_date=' +
                  date + '&start_offset=-10800&end_offset=10800&heartrate=true&steps=true&calories=true&gsr=true&skin_temp=true&bodystates=true';

    ask(chalk.green('What kind of data would you like?') + chalk.blue(' sleep/activities/details'), function (answer) {
        if (answer === 'sleep') {
            url = sleep;
        } else if (answer === 'activities') {
            url = activities;
        } else {
            url = details;
        }

        request.get({
                url: url,
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

    });
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

                getData(requestDate);
            } else {
                ask(chalk.green('Please enter new date.') + chalk.blue(' format: yyyy-mm-dd'), function (answer) {
                    requestDate = answer;

                    getData(requestDate);
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

module.exports = checkLogin;
