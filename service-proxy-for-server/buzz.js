'use strict';

const serviceUrls = require('../config/serviceUrls');
const config = require('../config');
const membership = require('../membership');
const proxy = require('../service-proxy/proxy');

module.exports = {
    getMemberCurrentLevel: function *(member_id) {
        return (yield proxy({
            host: config.buzz.inner.host,
            port: config.buzz.inner.port,
            path: serviceUrls.buzz.profile.currentLevel.upstream.replace(':member_id', member_id),
            method: 'GET',
            data: {}
        }));
    },

    getLatestCourse: function *(level) {
        return (yield proxy({
            host: config.buzz.inner.host,
            port: config.buzz.inner.port,
            path: require('koa-router').url(serviceUrls.buzz.courses.latest.upstream, {
                level: level
            }),
            method: 'GET',
            data: {}
        }));
    }
};