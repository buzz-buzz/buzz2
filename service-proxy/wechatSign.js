'use strict';

const config = require('../config');
const proxy = require('./proxy');
const greenSharedLogger = require('../common/logger')('/service-proxy/wechatSign.js');

module.exports = function (app, router, parse) {
    router
        .get(config.serviceUrls.wechat.sign.frontEnd, function *() {
            try {
                this.body = yield proxy({
                    host: config.wechatSign.inner.host,
                    port: config.wechatSign.inner.port,
                    path: config.serviceUrls.wechat.sign.upstream + '?url=' + this.query.url,
                    method: 'GET'
                });
            }catch(ex){
                greenSharedLogger.error(ex);
                this.throw(ex);
            }
        })
    ;
};