'use strict';

const serviceUrls = require('../config/serviceUrls');
const config = require('../config');
const membership = require('../membership');
const request = require('co-request');

function composeUrl(path) {
    return 'http://' + config.sso.inner.host + ':' + config.sso.inner.port + path;
}

function setHcdUser(result) {
    this.state.hcd_user = {
        member_id: result.result.member_id,
        token: result.result.token
    };
}
function setTokenCookie(result) {
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
}
function redirectToReturnUrl(result, returnUrl) {
    if (this.request.get('X-Request-With') === 'XMLHttpRequest') {
        result.isSuccess = false;
        result.code = 302;
        result.message = returnUrl;

        this.body = result;
    } else {
        this.redirect(returnUrl || '/');
    }
}
function *proxy(url, data, method) {
    let option = {
        uri: url,
        method: method || 'POST'
    };

    if (data) {
        option.json = Object.assign(data, {
            application_id: config.applicationId
        });
    }

    let result = yield request(option);

    result = result.body;
    return result;
}
module.exports = function (app, router, parse) {
    router
        .post(serviceUrls.sso.signIn.frontEnd, function *(next) {
            const url = composeUrl(serviceUrls.sso.signIn.upstream);
            let data = yield parse(this.request);
            let result = yield proxy.call(this, url, data);

            if (result.isSuccess) {
                setHcdUser.call(this, result);
                setTokenCookie.call(this, result);
                redirectToReturnUrl.call(this, result, decodeURIComponent(data.return_url));
            }

            this.body = result;
        })
        .get(serviceUrls.sso.profile.load.frontEnd, membership.ensureAuthenticated, function *(next) {
            this.body = yield proxy.call(this, composeUrl(serviceUrls.sso.profile.load.upstream.replace(':member_id', this.state.hcd_user.member_id)), null, 'GET');
        })
    ;
};