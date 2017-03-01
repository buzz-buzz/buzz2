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
        .get(serviceUrls.buzz.quiz.result.frontEnd, membership.ensureAuthenticated, function *(next) {
            let data = this.query;
            data.member_id = this.state.hcd_user.member_id;
            console.log('data = ', data);

            this.body = yield proxy(Object.assign({
                path: serviceUrls.buzz.quiz.result.upstream.get,
                data: data,
                method: 'POST'
            }, proxyOption));
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
        .get(serviceUrls.buzz.quiz.vocabularyPerformance.frontEnd, membership.ensureAuthenticated, function *() {
            this.body = yield proxy(Object.assign({
                path: Router.url(serviceUrls.buzz.quiz.vocabularyPerformance.upstream, {
                    member_id: this.state.hcd_user.member_id,
                    lesson_id: this.query.lesson_id
                }),
                method: 'GET'
            }, proxyOption));
        })
        .get(serviceUrls.buzz.quiz.dailyExercisePerformance.frontEnd, function *() {
            this.body = yield proxy(Object.assign({
                path: Router.url(serviceUrls.buzz.quiz.dailyExercisePerformance.upstream, {
                    quiz_result_group_id: this.query.quiz_result_group_id
                }),
                method: 'GET'
            }, proxyOption));
        })
    ;
};