'use strict';

const serviceUrls = require('../config/serviceUrls');
const config = require('../config');
const membership = require('../membership');
const proxy = require('../service-proxy/proxy');

module.exports = {
    //http://auth.bridgeplus.cn/wechat/oauth/callback?is_registed=true&token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtZW1iZXJfaWQiOiIwMzFiM2RmMi0xMjQ3LTRmM2EtYTUzMi1iZTU5N2RkYzAwNTIiLCJleHBpcmUiOjE0ODc0MTMyNDY5MDN9.FHdkr5vivj5rLOZQtmSbD-GwsNI8vLzBwDmo7nTHRss&openid=%20oE4jFt9jNGNrlvLbCS3eOy3w27qs
    getOAuthLink: function *() {
        return yield proxy({
            host: config.wechat.inner.host,
            port: config.wechat.inner.port,
            path: '/wechat/oauth/logon',
            method: 'POST',
            data: {
                app_id: config.wechat.inner.app_id,
                returnUrl: '/wechat/oauth/callback'
            }
        });
    }
};