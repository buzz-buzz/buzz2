'use strict';

const config = require('../../config');
const buzz = require('../../service-proxy-for-server/buzz');
const course = require('../../bll/course');
const mount = require('koa-mount');
const qs = require('querystring');

module.exports = function (app, router, render) {
    router.get('/m/bind-mobile', function *() {
        this.body = yield render('/m/bind-mobile', {
            config: config,
            queryString: qs.stringify(this.query)
        });
    });
};