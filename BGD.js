'use strict';

var request = require('request');
var fs = require('fs');
var readline = require('readline');

// example URLs for API
// for some reason, sleep must be submitted different than activities.
//
// https://app.mybasis.com/api/v2/users/me/days/2014-03-1/activities?type=sleep&expand=activities
// https://app.mybasis.com/api/v1/chart/me?summary=true&interval=60&units=ms&start_date=2014-03-01&start_offset=-10800&end_offset=10800&heartrate=true&steps=true&calories=true&gsr=true&skin_temp=true&bodystates=true
// https://app.mybasis.com/api/v2/users/me/days/2014-03-1/activities?type=run,walk,bike&expand=activities

var prompts = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var usr, psw;

function askForUser() {
    prompts.question('What is your Basis username? \n', function (answer) {
        usr = answer;

        askForPassword();
    });
}

function askForPassword() {
    prompts.question('What is your Basis password? \n', function (answer) {
        psw = answer;

        console.log(usr, psw);
        requestData(usr, psw);
        prompts.close();
    });
}

function getToken( error, response, body ) {
    // console.log(response.headers);
    var access_token = response.headers['set-cookie'][0].match( /access_token=([0-9a-f]+)/ ),
        // refresh_token = response.headers['set-cookie'][0].match( /refresh_token=([0-9a-f]+)/ ),
        expires = response.headers['set-cookie'][0].match( /expires=([0-9a-f]+)/ );

    request.get({
        url: 'https://app.mybasis.com/api/v1/user/me.json',
        // oauth:access_token[1],
        // headers: {
        //     'X-Basis-Authorization': "OAuth:" + access_token[1]
        // },
        jar: access_token,
        json: true
    }, function (e, r, user) {
        console.log(user);
    });
}

function requestData(usr, psw) {
    request({
        uri: 'https://app.mybasis.com/login',
        method: 'POST',
        form: {
            username: usr,
            password: psw
        },
        //timeout: 10000,
        followRedirect: true,
        maxRedirects: 10,
        jar: true
    }, getToken);
}

askForUser();
