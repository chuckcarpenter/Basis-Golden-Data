'use strict';

var mocha = require('mocha'),
    expect = require('chai').expect,
    bgd = require('../libs/basis-cli');

describe('Basis Golden Data', function () {
    describe('test login', function () {
        it('passes options to callback', function () {
            var args = ['test@test.com', 'password'];

            expect(function () {
                bgd(args);
            }).to.not.throw();
        });
    });
});
