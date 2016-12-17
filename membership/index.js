'use strict';

const util = require('util');
const config = require('../config');
const request = require('co-request');
const url = require('url');
const cookie = require('../helpers/cookie');

function * setHcdUserByToken(context) {
    let token = context.cookies.get('token');

    if (token) {
        let result = {
            result: {}
        };

        if (config.mock) {
            result = {
                isSuccess: true,
                result: {
                    member_id: 'fake member'
                }
            };
        } else {
            result = yield request({
                uri: 'http://' + config.sso.inner.host + ':' + config.sso.inner.port + '/token/parse',
                json: {token: token},
                method: 'POST'
            });

            result = result.body;
        }

        console.log(result);

        if (result.isSuccess) {
            context.state.hcd_user = {
                member_id: result.result.member_id,
                token: token
            };

            cookie.deleteMID.call(context);
            cookie.setMID.call(context, result.result.member_id);
        } else {
            delete context.state.hcd_user;
        }
    } else {
        delete context.state.hcd_user;
    }
}
let membership = {
    setHcdUser: function *(next) {
        let context = this;
        yield setHcdUserByToken(context);

        yield next;
    }
};

membership.ensureAuthenticated = function *(next) {
    let context = this;

    yield setHcdUserByToken(context);

    if (!context.state.hcd_user) {
        if (this.request.get('X-Request-With') === 'XMLHttpRequest') {
            let returnUrl = this.headers.referer;
            let result = {};
            result.isSuccess = false;
            result.code = 302;
            result.message = returnUrl || '/';

            return this.body = result;
        } else {
            return context.redirect('/sign-in?return_url=' + encodeURIComponent(context.request.originalUrl));
        }
    }

    yield next;
};

module.exports = membership;