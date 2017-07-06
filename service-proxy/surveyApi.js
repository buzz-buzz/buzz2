/**
 * Created by hank on 2017/7/6.
 */
'use strict';

const config = require('../config');
const membership = require('../membership');
const proxy = require('./proxy');
const url = require('url');


module.exports = function (app, router, parse) {
    router
        .get(config.serviceUrls.wechat.surveyApi.get.frontEnd, membership.ensureAuthenticated, function *() {
            this.body = yield proxy({
                host: config.wechatSign.inner.host,
                port: config.wechatSign.inner.port,
                path: config.serviceUrls.wechat.surveyApi.get.upstream.replace(':member_id', this.state.hcd_user.member_id)
                    .replace(':short_id', this.query.short_id)
                    .replace(':user', 'buzzbuzz')
                    .replace(':test', this.query.test ? this.query.test : ''),
                method: 'GET'
            });
        })
        .get(config.serviceUrls.wechat.answerApi.get.frontEnd, membership.ensureAuthenticated, function *() {
            let urlData = yield proxy({
                host: config.wechatSign.inner.host,
                port: config.wechatSign.inner.port,
                path: config.serviceUrls.wechat.answerApi.get.upstream.replace(':member_id', this.state.hcd_user.member_id)
                    .replace(':short_id', this.query.short_id)
                    .replace(':user', 'buzzbuzz')
                    .replace(':date_type', this.query.data_type),
                method: 'GET'
            });

            urlData = url.parse(urlData);

            this.body = yield  proxy({
                host: urlData.host,
                port: 80,
                path: urlData.path,
                method: 'GET'
            })
        })
    ;
};