'use strict';

const config = require('../config');
const proxy = require('./proxy');

module.exports = function (app, router, parse) {
    router
        .get(config.serviceUrls.wechat.sign.frontEnd, function *() {
            this.body = yield proxy({
                host: config.wechatSign.inner.host,
                port: config.wechatSign.inner.port,
                path: config.serviceUrls.wechat.sign.upstream + '?url=' + this.query.url,
                method: 'GET'
            });
        })
    ;
};