'use strict';

const config = require('../../config');
const buzz = require('../../service-proxy-for-server/buzz');
const course = require('../../bll/course');
const mount = require('koa-mount');
const qs = require('querystring');
const membership = require('../../membership');

module.exports = function (app, router, render) {
    router
        .get('/m/bind-mobile', function *() {
            this.body = yield render('/m/bind-mobile', {
                config: config,
                queryString: qs.stringify(this.query)
            });
        })
        .get('/m/my/today', membership.setHcdUserIfSignedIn, function *() {
            this.body = yield render('/m/my/today', {
                config: config,
                hcd_user: this.state.hcd_user
            });
        })
        .get('/m/my/play', function *() {
            this.body = yield render('/m/my/today', {
                config: config
            });
        })
        .get('/m/player', function*() {
            this.body = yield render('/m/player', {config: config})
        })
    ;
};