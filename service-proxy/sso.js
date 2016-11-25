'use strict';

const serviceUrls = require('../config/serviceUrls');
const config = require('../config');
const membership = require('../membership');
const proxy = require('./proxy');
const cookie = require('../helpers/cookie');
const url = require('url');

function setHcdUser(result) {
    this.state.hcd_user = {
        member_id: result.result.member_id,
        token: result.result.token
    };
}
function setTokenCookie(result) {
    let cookieOption = {
        expires: 0,
        path: '/',
        httpOnly: true
    };

    cookie.deleteToken.call(this);

    this.cookies.set('token', result.result.token, cookieOption);
}
function redirectToReturnUrl(result, returnUrl) {
    if (this.request.get('X-Request-With') === 'XMLHttpRequest') {
        result.isSuccess = false;
        result.code = 302;
        result.message = returnUrl || '/';

        this.body = result;
    } else {
        this.redirect(returnUrl || '/');
    }
}
module.exports = function (app, router, parse) {
    router
        .post(serviceUrls.sso.signIn.frontEnd, function *(next) {
            let data = yield parse(this.request);

            let result = {};

            if (config.mock) {
                result = {
                    isSuccess: true,
                    result: {
                        member_id: 'fake',
                        token: 'fake'
                    }
                };
            } else {
                result = yield proxy.call(this, {
                    host: config.sso.inner.host,
                    port: config.sso.inner.port,
                    path: serviceUrls.sso.signIn.upstream,
                    data: data
                });
            }

            if (result.isSuccess) {
                setHcdUser.call(this, result);
                setTokenCookie.call(this, result);
                redirectToReturnUrl.call(this, result, decodeURIComponent(data.return_url));
            }

            this.body = result;
        })
        .get(serviceUrls.sso.profile.load.frontEnd, membership.ensureAuthenticated, function *(next) {
            if (config.mock) {
                return this.body = {
                    isSuccess: true,
                    result: {}
                };
            }

            this.body = yield proxy.call(this, {
                host: config.sso.inner.host,
                port: config.sso.inner.port,
                path: serviceUrls.sso.profile.load.upstream.replace(':member_id', this.state.hcd_user.member_id),
                method: 'GET'
            });
        })
        .put(serviceUrls.sso.signUp.frontEnd, function *parseData(next) {
            let data = yield parse(this.request);
            this.upstreamData = data;

            yield next;
        }, function *validateForm(next) {
            let data = this.upstreamData;

            if (!data.agreed) {
                return this.body = {
                    isSuccess: false,
                    message: '你没有同意《BUZZ 用户注册协议》'
                };
            }

            yield next;
        }, function *validateSms(next) {
            const referer = url.parse(this.headers.referer);

            if (referer.pathname === '/sign-up' && referer.query && referer.query.indexOf('skipvalidation=true') >= 0) {
                return yield next;
            }

            let data = this.upstreamData;

            let result = yield proxy.call(this, {
                host: config.sms.inner.host,
                port: config.sms.inner.port,
                path: serviceUrls.sms.validate.upstream,
                data: {
                    phone: data.mobile,
                    value: data.verificationCode
                },
                method: 'POST'
            });

            if (!result.isSuccess || !result.result) {
                return this.body = result;
            }

            yield next;
        }, function *(next) {
            let data = this.upstreamData;

            this.body = yield proxy.call(this, {
                host: config.sso.inner.host,
                port: config.sso.inner.port,
                path: serviceUrls.sso.signUp.upstream,
                method: 'POST',
                data: data
            });
        })
    ;
};