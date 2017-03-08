'use strict';

const serviceUrls = require('../config/serviceUrls');
const config = require('../config');
const membership = require('../membership');
const proxy = require('./proxy');
const cookie = require('../helpers/cookie');
const url = require('url');

function resetCookies(result) {
    cookie.deleteToken.call(this);
    cookie.deleteMID.call(this);

    cookie.setToken.call(this, result.token);
    cookie.setMID.call(this, result.member_id);
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

let proxyOption = {
    host: config.sso.inner.host,
    port: config.sso.inner.port
};

function *validateSms(next) {
    const referer = url.parse(this.headers.referer);

    if ((referer.pathname === '/sign-up' || referer.pathname === '/reset-password' ) && referer.query && referer.query.indexOf('skipvalidation=true') >= 0) {
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
}

function * bindWechatAccount(token, member_id) {
    if (token) {
        let bindResult = yield proxy({
            host: config.sso.inner.host,
            port: config.sso.inner.port,
            path: serviceUrls.sso.profile.update.upstream,
            data: {
                member_id: member_id,
                token: token
            }
        });

        console.log('>>> bind wechat account result <<<<');
        console.log(bindResult);
    }
}

module.exports = function (app, router, parse) {
    function *updateProfile(next) {
        let data = this.upstreamData;

        if (!data) {
            data = (yield parse(this.request));
        }

        if (!data.member_id) {
            data.member_id = this.state.hcd_user.member_id;
        }

        this.body = yield proxy.call(this, {
            host: config.sso.inner.host,
            port: config.sso.inner.port,
            path: serviceUrls.sso.profile.update.upstream,
            method: 'POST',
            data: data
        });
    }

    function *parseData(next) {
        this.upstreamData = yield parse(this.request);

        yield next;
    }

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
                membership.setHcdUser(this, result.result);
                yield bindWechatAccount(data.token, result.result.member_id);
                resetCookies.call(this, result.result);
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
        .put(serviceUrls.sso.signUp.frontEnd, parseData, function *validateForm(next) {
            let data = this.upstreamData;

            if (!data.agreed) {
                return this.body = {
                    isSuccess: false,
                    message: '你没有同意《BUZZ 用户注册协议》'
                };
            }

            yield next;
        }, validateSms, function *(next) {
            let data = this.upstreamData;

            this.body = yield proxy.call(this, {
                host: config.sso.inner.host,
                port: config.sso.inner.port,
                path: serviceUrls.sso.signUp.upstream,
                method: 'POST',
                data: data
            });
        })
        .post(serviceUrls.sso.profile.update.frontEnd, membership.ensureAuthenticated, updateProfile)
        .post(serviceUrls.sso.profile.changeMobile.frontEnd, parseData, membership.ensureAuthenticated, validateSms, updateProfile)
        .post(serviceUrls.sso.profile.changePassword.frontEnd, membership.ensureAuthenticated, function *() {
            let data = yield parse(this.request);
            data.member_id = this.state.hcd_user.member_id;

            this.body = yield proxy(Object.assign({
                path: serviceUrls.sso.profile.changePassword.upstream,
                method: 'POST',
                data: data
            }, proxyOption));
        })
        .post(serviceUrls.sso.resetPassword.frontEnd, parseData, validateSms, function *() {
            let data = this.upstreamData;

            this.body = yield proxy(Object.assign({
                path: serviceUrls.sso.resetPassword.upstream,
                method: 'POST',
                data: data
            }, proxyOption));
        })
    ;
};