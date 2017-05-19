'use strict';

const serviceUrls = require('../config/serviceUrls');
const config = require('../config');
const membership = require('../membership');
const proxy = require('../service-proxy/proxy');
const Router = require('koa-router');

module.exports = {
    getMemberCurrentLevel: function* (member_id) {
        return (yield proxy({
            host: config.buzz.inner.host,
            port: config.buzz.inner.port,
            path: serviceUrls.buzz.profile.currentLevel.upstream.replace(':member_id', member_id),
            method: 'GET',
            data: {}
        }));
    },

    getLatestCourse: function* (level) {
        return (yield proxy({
            host: config.buzz.inner.host,
            port: config.buzz.inner.port,
            path: Router.url(serviceUrls.buzz.courses.latest.upstream, {
                level: level
            }),
            method: 'GET',
            data: {}
        }));
    },
    getLatestCourseFor: function* (member_id, level) {
        let path = Router.url(serviceUrls.buzz.courses.latestFor.upstream, {
            level: level,
            member_id: member_id,
        });

        return (yield proxy({
            host: config.buzz.inner.host,
            port: config.buzz.inner.port,
            path: path,
            method: 'GET',
            data: {}
        }));
    },
};