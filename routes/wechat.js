'use strict';

const membership = require('../membership');
const cookie = require('../helpers/cookie');
const config = require('../config');
const qs = require('querystring');

module.exports = function (app, router, render) {
    router
    //http://buzzbuzzenglish.com/wechat/oauth/callback?from=%2Fmy%2Ftoday&is_registed=true&token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtZW1iZXJfaWQiOiIwMzFiM2RmMi0xMjQ3LTRmM2EtYTUzMi1iZTU5N2RkYzAwNTIiLCJleHBpcmUiOjE0ODc2NTc0ODMzMDd9.dFi6Y6rdMF4T5Kwuyrptyxd1rig1MnDL-ll2iWm5r34&openid=%20oE4jFt9jNGNrlvLbCS3eOy3w27qs
        .get('/wechat/oauth/callback', function *() {
            let registered = this.query.is_registed;
            let token = this.query.token;
            let fromUrl = this.query.from;

            cookie.deleteToken.call(this);
            cookie.setToken.call(this, token);

            if (/^true$/.test(registered)) {
                this.body = yield render('wechat/oauth-callback', {
                    registered: registered,
                    token: token,
                    fromUrl: fromUrl,
                    config: config
                });
            } else {
                this.redirect('/m/sign-up?from=' + fromUrl + '&token=' + token + '&extra=' + qs.stringify(this.query));
            }
        })
    ;
};