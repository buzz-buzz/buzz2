'use strict';

const util = require('util');
const config = require('../config');
const request = require('co-request');
const url = require('url');
const cookie = require('../helpers/cookie');

function setHcdUser(context, data) {
    context.state.hcd_user = {
        member_id: data.member_id,
        token: data.token,

        isAdmin: config.admins.indexOf(data.member_id) >= 0
    };
}

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

        if (result.isSuccess) {
            setHcdUser(context, {
                member_id: result.result.member_id,
                token: token
            });

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
    setHcdUserByToken: function *(next) {
        let context = this;
        yield setHcdUserByToken(context);

        yield next;
    },

    setHcdUser: setHcdUser
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

membership.ensureAdmin = function *(next) {
    yield setHcdUserByToken(this);

    if (!this.state.hcd_user || !this.state.hcd_user.isAdmin) {
        require('../helpers/cookie').deleteToken.apply(this);
        return this.redirect('/sign-in?return_url=' + encodeURIComponent(this.request.originalUrl));
    }

    yield next;
};

module.exports = membership;