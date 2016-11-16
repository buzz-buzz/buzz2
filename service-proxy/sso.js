'use strict';

const serviceUrls = require('../config/serviceUrls');
const config = require('../config');
const request = require('co-request');

module.exports = function (app, route, parse) {
    app.use(route.post(serviceUrls.sso.signIn.frontEnd, function *(next) {
        const url = 'http://' + config.sso.inner.host + ':' + config.sso.inner.port + serviceUrls.sso.signIn.upstream;
        let data = yield parse(this.request);

        let result = yield request({
            uri: url, json: Object.assign(data, {
                application_id: config.applicationId
            }), method: 'POST'
        });

        this.body = result.body;
    }));
};