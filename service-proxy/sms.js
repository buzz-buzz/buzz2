'use strict';

const config = require('../config');
const serviceUrls = config.serviceUrls;
const proxy = require('./proxy');

module.exports = function (app, router, parse) {
    router
        .put(serviceUrls.sms.sendWithCaptcha.frontEnd, function *() {
            let data = yield parse(this.request);

            let result = yield proxy.call(this, {
                host: config.captcha.inner.host,
                port: config.captcha.inner.port,
                path: '/captcha/validate',
                method: 'POST',
                data: {
                    id: data.captchaId,
                    value: data.captcha
                }
            });

            if (!result.isSuccess || !result.result) {
                this.body = result;
            } else {
                this.body = yield proxy.call(this, {
                    host: config.sms.inner.host,
                    port: config.sms.inner.port,
                    path: serviceUrls.sms.sendWithCaptcha.upstream,
                    method: 'POST',
                    data: {
                        phone: data.mobile,
                        code: config.sms.inner.code
                    }
                });
            }
        })
    ;
};