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
        .get(serviceUrls.buzz.memberCourse.count.frontEnd, membership.ensureAuthenticated, function* () {
            this.body = yield proxy(Object.assign({
                path: Router.url(serviceUrls.buzz.memberCourse.count.upstream, {
                    member_id: this.state.hcd_user.member_id
                }),
                method: 'GET'
            }, proxyOption));
        })
        .post(serviceUrls.buzz.memberCourse.save.frontEnd, membership.ensureAuthenticated, function* () {
            this.body = yield proxy(Object.assign({
                path: serviceUrls.buzz.memberCourse.save.upstream,
                method: 'POST',
                data: Object.assign(yield parse(this.request), {
                    member_id: this.state.hcd_user.member_id
                })
            }, proxyOption));
        })
        .get(serviceUrls.buzz.memberPaidCourse.get.frontEnd, membership.ensureAuthenticated, function* () {
            this.body = yield proxy(Object.assign({
                path: Router.url(serviceUrls.buzz.memberPaidCourse.get.upstream.replace(':member_id', this.state.hcd_user.member_id),{

                }),
                method: 'GET'
            }, proxyOption));
        })
        .get('/service-proxy/buzz/courses/B/latest-new', function* () {
            this.body = yield proxy(Object.assign({
                path: Router.url('/courses/B/latest',{

                }),
                method: 'GET'
            }, proxyOption));
        })
        ;
};