/**
 * Created by hank on 2017/6/12.
 */
'use strict';

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
        .get(serviceUrls.buzz.lessonVisited.count.frontEnd, membership.setHcdUserIfSignedIn, function*() {
            this.body = yield proxy(Object.assign({
                path: serviceUrls.buzz.lessonVisited.count.upstream.replace(':lesson_id', this.query.lesson_id),
                method: 'GET'
            }, proxyOption));
        })
        .post(serviceUrls.buzz.lessonVisited.save.frontEnd, membership.ensureAuthenticated, function*() {
            this.body = yield proxy(Object.assign({
                path: serviceUrls.buzz.lessonVisited.save.upstream.replace(':lesson_id', this.query.lesson_id).replace(':member_id', this.state.hcd_user.member_id),
                method: 'POST'
            }, proxyOption));
        })
    ;
};