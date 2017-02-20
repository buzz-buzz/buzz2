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
        .get(serviceUrls.buzz.profile.latestEducation.frontEnd, membership.ensureAuthenticated, function*() {
            this.body = yield proxy(Object.assign({
                path: serviceUrls.buzz.profile.latestEducation.upstream.replace(':member_id', this.state.hcd_user.member_id),
                method: 'GET'
            }, proxyOption));
        })
        .get(serviceUrls.buzz.profile.latestAllEducation.frontEnd, membership.ensureAuthenticated, function*() {
            this.body = yield proxy(Object.assign({
                path: serviceUrls.buzz.profile.latestAllEducation.upstream.replace(':member_id', this.state.hcd_user.member_id),
                method: 'GET'
            }, proxyOption));
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
        .get(serviceUrls.buzz.courses.findByLevel.frontEnd, membership.ensureAuthenticated, function*(next) {
            this.body = yield proxy.call(this, {
                host: config.buzz.inner.host,
                port: config.buzz.inner.port,
                path: Router.url(serviceUrls.buzz.courses.findByLevel.upstream, {
                    level: this.params.level
                }),
                method: 'GET'
            });
        })
        .get(serviceUrls.buzz.courses.findByDate.frontEnd, membership.ensureAuthenticated, function*(next) {
            this.body = yield proxy.call(this, {
                host: config.buzz.inner.host,
                port: config.buzz.inner.port,
                path: Router.url(serviceUrls.buzz.courses.findByDate.upstream, {
                    category: this.params.category.toUpperCase(),
                    level: this.params.level,
                    date: this.params.date
                }),
                method: 'GET'
            });
        })

        .post(serviceUrls.buzz.courseViews.frontEnd, function *(next) {
            this.body = yield proxy({
                host: config.buzz.inner.host,
                port: config.buzz.inner.port,
                path: Router.url(serviceUrls.buzz.courseViews.upstream, {
                    category: this.params.category.toUpperCase(),
                    level: this.params.level,
                    lesson_id: this.params.lesson_id
                }),
                method: 'POST'
            });
        })
        .get(serviceUrls.buzz.courseViews.frontEnd, function *(next) {
            this.body = yield proxy(Object.assign({
                path: Router.url(serviceUrls.buzz.courseViews.upstream, {
                    category: this.params.category.toUpperCase(),
                    level: this.params.level,
                    lesson_id: this.params.lesson_id
                }),
                method: 'GET'
            }, proxyOption));
        })

        .get(serviceUrls.buzz.categories.list.frontEnd, function *(next) {
            this.body = yield proxy(Object.assign({
                path: serviceUrls.buzz.categories.list.upstream,
                method: 'GET'
            }, proxyOption));
        })
        .get(serviceUrls.buzz.profile.currentLevel.frontEnd, membership.ensureAuthenticated, function *(next) {
            let memberId = this.state.hcd_user.member_id;

            this.body = yield proxy(Object.assign({
                path: serviceUrls.buzz.profile.currentLevel.upstream.replace(':member_id', memberId),
                method: 'GET'
            }, proxyOption));
        })
        // quiz
        .post(serviceUrls.buzz.quiz.getResult.frontEnd, function *(next) {
            var data = yield parse(this.request);

            this.body = yield proxy({
                host: config.buzz.inner.host,
                port: config.buzz.inner.port,
                path: serviceUrls.buzz.quiz.getResult.upstream,
                data: data,
                method: 'POST'
            });
        })
        .post(serviceUrls.buzz.quiz.saveResult.frontEnd, function *(next) {
            var data = yield parse(this.request);

            this.body = yield proxy({
                host: config.buzz.inner.host,
                port: config.buzz.inner.port,
                path: serviceUrls.buzz.quiz.saveResult.upstream,
                data: data,
                method: 'POST'
            });
        })
    ;
};