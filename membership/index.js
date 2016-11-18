'use strict';

const util = require('util');
const config = require('../config');
const request = require('co-request');

let membership = {
    setHcdUser: function *(next) {
        let context = this;
        let token = context.cookies.get('token');

        if (token) {
            let result = yield request({
                uri: 'http://' + config.sso.inner.host + ':' + config.sso.inner.port + '/token/parse',
                json: {token: token},
                method: 'POST'
            });

            result = result.body;

            context.state.hcd_user = {
                member_id: result.result.member_id,
                token: token
            };
        }

        yield next;
    }
};

membership.ensureAuthenticated = function *(next) {
    let context = this;

    yield membership.setHcdUser.apply(context, [next]);

    if (!context.state.hcd_user) {
        console.log('you should login to visit: ', context.request.originalUrl);
        context.redirect('/sign-in?return_url=' + encodeURIComponent(context.request.originalUrl));
    }

    yield next;
};

module.exports = membership;