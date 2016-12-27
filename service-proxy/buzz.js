'use strict';

const serviceUrls = require('../config/serviceUrls');
const config = require('../config');
const membership = require('../membership');
const proxy = require('./proxy');

module.exports = function (app, router, parse) {
    router
        .put(serviceUrls.buzz.profile.education.frontEnd, membership.ensureAuthenticated, function *(next) {
            let data = yield parse(this.request);

            this.body = yield proxy.call(this, {
                host: config.buzz.inner.host,
                port: config.buzz.inner.port,
                path: serviceUrls.buzz.profile.education.upstream.replace(':member_id', this.state.hcd_user.member_id),
                method: 'PUT',
                data: data
            });
        })
        .get(serviceUrls.buzz.courses.find.frontEnd, membership.ensureAuthenticated, function*(next) {
            let category = this.params.category;
            let level = this.params.level;
            let enabled = this.params.enabled;

            this.body = yield proxy.call(this, {
                host: config.buzz.inner.host,
                port: config.buzz.inner.port,
                path: serviceUrls.buzz.courses.find.upstream.replace(':category', category).replace(':level', level).replace(':enabled', enabled),
                method: 'GET'
            });
        })
    ;
};