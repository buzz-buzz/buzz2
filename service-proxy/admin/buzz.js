'use strict';

const serviceUrls = require('../../config/serviceUrls');
const config = require('../../config');
const proxy = require('../proxy');

module.exports = function (app, router, parse) {
    router
        .put(serviceUrls.buzz.admin.course.frontEnd, function *(next) {
            let data = yield parse(this.request);

            this.body = yield proxy.call(this, {
                host: config.buzz.inner.host,
                port: config.buzz.inner.port,
                path: serviceUrls.buzz.admin.course.upstream,
                method: 'PUT',
                data: data
            });
        })
        .post(serviceUrls.buzz.admin.course.frontEnd, function *(next) {
            let data = yield parse(this.request);

            this.body = yield proxy.call(this, {
                host: config.buzz.inner.host,
                port: config.buzz.inner.port,
                path: serviceUrls.buzz.admin.course.upstream,
                method: 'POST',
                data: data
            });
        })
        .get(serviceUrls.buzz.admin.course.frontEnd + '/:lesson_id', function *(next) {
            let lesson_id = this.params.lesson_id;

            this.body = yield proxy.call(this, {
                host: config.buzz.inner.host,
                port: config.buzz.inner.port,
                path: serviceUrls.buzz.admin.course.upstream + '/' + lesson_id,
                method: 'GET'
            });
        })
    ;
};