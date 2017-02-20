'use strict';

const serviceUrls = require('../config/serviceUrls');
const config = require('../config');
const membership = require('../membership');
const proxy = require('../service-proxy/proxy');

module.exports = {
    getOAuthLink: function *() {
        return yield proxy({
            host: config.wechat.inner.host,
            port: config.wechat.inner.port,
            path: '/wechat/oauth/logon',
            method: 'POST',
            data: {
                app_id: config.wechat.inner.app_id,
                returnUrl: config.wechat.returnHost + '/wechat/oauth/callback'
            }
        });
    }
};