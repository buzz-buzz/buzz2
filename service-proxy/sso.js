'use strict';

const serviceUrls = require('../config/serviceUrls');
const config = require('../config');
const request = require('co-request');

module.exports = function (app, route, parse) {
    route.post(serviceUrls.sso.signIn.frontEnd, function *(next) {
        const url = 'http://' + config.sso.inner.host + ':' + config.sso.inner.port + serviceUrls.sso.signIn.upstream;
        let data = yield parse(this.request);

        let result = yield request({
            uri: url, json: Object.assign(data, {
                application_id: config.applicationId
            }), method: 'POST'
        });

        result = result.body;

        if (result.isSuccess) {
            this.state.hcd_user = {
                member_id: result.result.member_id,
                token: result.result.token
            };
        }

        let clearCookieOption = {
            expires: new Date(1970, 1, 1),
            path: '/',
            httpOnly: true
        };

        let cookieOption = {
            expires: 0,
            path: '/',
            httpOnly: true
        };

        this.cookies.set('token', '', clearCookieOption);

        this.cookies.set('token', result.result.token, cookieOption);

        let returnUrl = decodeURIComponent(data.return_url);

        if (this.request.get('X-Request-With') === 'XMLHttpRequest') {
            result.isSuccess = false;
            result.code = 302;
            result.message = returnUrl;

            this.body = result;
        } else {
            this.redirect(returnUrl || '/');
        }
    });
};