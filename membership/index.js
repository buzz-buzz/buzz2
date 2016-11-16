'use strict';

const util = require('util');
const proxy = require('node-service-proxy');
const config = require('../config');

function parseHcdUserByToken(req, res, next) {
    let token = req.cookies.token;

    if (token) {
        proxy(req, res, next, {
            host: config.sso.inner.host,
            port: config.sso.inner.port,
            path: '/token/parse',
            dataMapper: function (d) {
                d.token = token;

                return d;
            },
            continueNext: true,
            method: 'POST'
        });
    } else {
        next();
    }
}

module.exports = {
    parseHcdUserByToken: parseHcdUserByToken,
    setHcdUser: [parseHcdUserByToken, function (req, res, next) {
        if (req.upstreamData) {
            try {
                var response = JSON.parse(req.upstreamData.toString());
                if (response.isSuccess) {
                    res.locals.hcd_user = response.result;
                }
            } catch (ex) {
                return next(ex);
            }
        } else if (require('../config').mock) {
            res.locals.hcd_user = {member_id: 'mock'};
        }

        next();
    }],

    setAuthTokenToCookie: function (req, res, next, token) {
        var cookieOption = {
            expires: 0,
            path: '/',
            httpOnly: true
        };

        res.cookie('token', token, cookieOption);
    }
};