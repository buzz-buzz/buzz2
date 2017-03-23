'use strict';

const config = require('../../config');
const buzz = require('../../service-proxy-for-server/buzz');
const course = require('../../bll/course');
const mount = require('koa-mount');

module.exports = function (app, router, render) {
    router
        .get('/s/player', function *() {
            this.body = yield render('my/player', {config: config});
        })
        .get('/s/ad', function*() {
            this.body = yield render('ad', {config: config});
        })
    ;
};
