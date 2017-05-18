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
        .put(serviceUrls.buzz.profile.education.frontEnd, membership.ensureAuthenticated, function* (next) {
            let data = yield parse(this.request);

            this.body = yield proxy.call(this, {
                host: config.buzz.inner.host,
                port: config.buzz.inner.port,
                path: serviceUrls.buzz.profile.education.upstream.replace(':member_id', this.state.hcd_user.member_id),
                method: 'PUT',
                data: data
            });
        })
        .get(serviceUrls.buzz.profile.latestEducation.frontEnd, membership.ensureAuthenticated, function* () {
            this.body = yield proxy(Object.assign({
                path: serviceUrls.buzz.profile.latestEducation.upstream.replace(':member_id', this.state.hcd_user.member_id),
                method: 'GET'
            }, proxyOption));
        })
        .get(serviceUrls.buzz.profile.memberTag.frontEnd, membership.ensureAuthenticated, function* () {
            this.body = yield proxy(Object.assign({
                path:
                serviceUrls.buzz.profile.memberTag.upstream.replace(':member_id', this.state.hcd_user.member_id),
                method: 'GET'
            }, proxyOption));
        })
        .get(serviceUrls.buzz.profile.lessonTag.frontEnd,membership.ensureAuthenicated,function*(){
            this.body=yield proxy(Object.assign({
                path:
                serviceUrls.buzz.profile.lessonTag.upstream.replace(':lesson_id',this.state.hcd_user.lesson_id),
                method: 'GET'
            },proxyOption));
        })
        .get(serviceUrls.buzz.profile.latestAllEducation.frontEnd, membership.ensureAuthenticated, function* () {
            this.body = yield proxy(Object.assign({
                path: serviceUrls.buzz.profile.latestAllEducation.upstream.replace(':member_id', this.state.hcd_user.member_id),
                method: 'GET'
            }, proxyOption));
        })
        .get(serviceUrls.buzz.courses.find.frontEnd, membership.ensureAuthenticated, function* (next) {
            let category = this.params.category;
            let level = this.params.level;
            let enabled = this.params.enabled;

            this.body = yield proxy.call(this, {
                host: config.buzz.inner.host,
                port: config.buzz.inner.port,
                path: serviceUrls.buzz.courses.find.upstream.replace(':category', category).replace(':level', level).replace(':enabled', enabled) + '?' + qs.stringify(this.query),
                method: 'GET'
            });
        })
        .get(serviceUrls.buzz.courses.findByLevel.frontEnd, membership.ensureAuthenticated, function* (next) {
            let self = this;

            this.body = yield proxy.call(this, {
                host: config.buzz.inner.host,
                port: config.buzz.inner.port,
                path: Router.url(serviceUrls.buzz.courses.findByLevel.upstream + '?' + qs.stringify(self.query), {
                    level: this.params.level
                }),
                method: 'GET'
            });
        })
        .get(serviceUrls.buzz.courses.findByDate.frontEnd, function* (next) {
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

        .post(serviceUrls.buzz.courseViews.frontEnd, function* (next) {
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
        .get(serviceUrls.buzz.courseViews.frontEnd, function* (next) {
            this.body = yield proxy(Object.assign({
                path: Router.url(serviceUrls.buzz.courseViews.upstream, {
                    category: this.params.category.toUpperCase(),
                    level: this.params.level,
                    lesson_id: this.params.lesson_id
                }),
                method: 'GET'
            }, proxyOption));
        })

        .get(serviceUrls.buzz.categories.list.frontEnd, function* (next) {
            this.body = yield proxy(Object.assign({
                path: serviceUrls.buzz.categories.list.upstream,
                method: 'GET'
            }, proxyOption));
        })
        .get(serviceUrls.buzz.profile.currentLevel.frontEnd, membership.ensureAuthenticated, function* (next) {
            let memberId = this.state.hcd_user.member_id;

            this.body = yield proxy(Object.assign({
                path: serviceUrls.buzz.profile.currentLevel.upstream.replace(':member_id', memberId),
                method: 'GET'
            }, proxyOption));
        })
        .get(serviceUrls.buzz.courses.search.frontEnd, function* () {
            this.body = yield proxy(Object.assign({
                path: serviceUrls.buzz.courses.search.upstream + '?' + qs.stringify(this.query),
                data: this.query,
                method: 'GET'
            }, proxyOption))
        })
        .get(serviceUrls.buzz.weekly.getScore.frontEnd, membership.ensureAuthenticated, function* () {
            this.body = yield proxy(Object.assign({
                path: '/weekly-quiz/' + this.state.hcd_user.member_id + '/' + this.query.lesson_id,
                method: 'GET'
            }, proxyOption))
        })
        ;

    require('./buzz-quiz')(app, router, parse);
};