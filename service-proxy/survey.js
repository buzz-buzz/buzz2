
'use strict';

const config = require('../config');
const serviceUrls = config.serviceUrls;
const membership = require('../membership');
const proxy = require('./proxy');
const Router = require('koa-router');
const qs = require('querystring');
const surveyBll = require('../bll/survey');

const proxyOption = {
    host: config.buzz.inner.host,
    port: config.buzz.inner.port,
};

module.exports = function (app, router, parse) {
    router
        .get(serviceUrls.buzz.survey.get.frontEnd, function* () {
            this.body = yield proxy(Object.assign({
                path: serviceUrls.buzz.survey.get.upstream,
                method: 'GET'
            }, proxyOption));
        })
        .get(serviceUrls.buzz.survey.latest.frontEnd, function* () {
            let latest = yield proxy(Object.assign({
                path: serviceUrls.buzz.survey.latest.upstream,
                method: 'GET'
            }, proxyOption));

            try {
                latest = JSON.parse(latest);
                this.body = surveyBll.getShortId(latest.survey_url);
            } catch (ex) {
                this.body = '';
            }
        })
        .get(serviceUrls.buzz.survey.answer.frontEnd, function* () {
            console.log('called by wenjun ==========>>>>>>>>>');
            console.log(this.req.url);
            this.body = yield proxy(Object.assign({
                path: serviceUrls.buzz.survey.answer.upstream,
                method: 'PUT',
                data: {
                    member_id: this.query.wj_respondent,
                    short_id: this.query.wj_short_id,
                    wj_user: 'buzzbuzz',
                    data_type: 'json'
                }
            }, proxyOption));
        })
        ;
};
