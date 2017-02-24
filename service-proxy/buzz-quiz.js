'use strict';

const config = require('../config');
const serviceUrls = config.serviceUrls;
const membership = require('../membership');
const proxy = require('./proxy');
const Router = require('koa-router');

const proxyOption = {
    host: config.buzz.inner.host,
    port: config.buzz.inner.port,
};

module.exports = function (app, router, parse) {
    router
        .get(serviceUrls.buzz.quiz.getResult.frontEnd, function *(next) {
            var data = yield parse(this.request);

            this.body = yield proxy({
                host: config.buzz.inner.host,
                port: config.buzz.inner.port,
                path: serviceUrls.buzz.quiz.getResult.upstream,
                data: data,
                method: 'POST'
            });
        })
        .put(serviceUrls.buzz.quiz.result.frontEnd, membership.ensureAuthenticated, function *(next) {
            let data = {
                member_id: this.state.hcd_user.member_id
            };

            this.body = yield proxy(Object.assign({
                path: serviceUrls.buzz.quiz.result.upstream.save,
                data: Object.assign(data, yield parse(this.request)),
                method: 'POST'
            }, proxyOption));
        })
        .put(serviceUrls.buzz.quiz.resultGroup.frontEnd, membership.ensureAuthenticated, function *(next) {
            let data = {
                member_id: this.state.hcd_user.member_id
            };

            this.body = yield proxy(Object.assign({
                path: serviceUrls.buzz.quiz.resultGroup.upstream.save,
                data: Object.assign(data, yield parse(this.request)),
                method: 'POST'
            }, proxyOption))
        })
    ;
};