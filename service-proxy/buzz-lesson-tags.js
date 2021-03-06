/**
 * Created by hank on 2017/6/21.
 */

const config = require('../config');
const serviceUrls = config.serviceUrls;
const membership = require('../membership');
const proxy = require('./proxy');
const Router = require('koa-router');
const qs = require('querystring');

const proxyOption = {
    host: config.buzz.inner.host,
    port: config.buzz.inner.port,
};

module.exports = function (app, router, parse) {
    router
        .get(serviceUrls.buzz.lessonGetTags.get.frontEnd, membership.setHcdUserIfSignedIn, function*() {
            this.body = yield proxy(Object.assign({
                path: serviceUrls.buzz.lessonGetTags.get.upstream.replace(':lesson_id', this.query.lesson_id),
                method: 'GET'
            }, proxyOption));
        })
    ;
};