'use strict';

const wechat = require('../service-proxy-for-server/wechat');

module.exports = function * wechatOAuth(next) {
    if (!/MicroMessenger/i.test(this.state.userAgent.source)) {
        return yield next;
    }

    if (this.path !== '/m/sign-in') {
        return yield next;
    }

    let res = yield wechat.getOAuthLink(this.url);

    if (!res.isSuccess) {
        return yield next;
    }

    this.redirect(res.result);
};