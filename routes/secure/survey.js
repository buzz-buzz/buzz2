'use strict';

const config = require('../../config');
const saas = require('../../bll/saas');
const membership = require('../../membership');
const url = require('url');
const proxy = require('../../service-proxy/proxy');
const surveyBll = require('../../bll/survey');

module.exports = function (app, router, render) {
    router
        .get('/survey', saas.checkSaasReferer, membership.ensureAuthenticated, function* () {
            let view = '/survey';

            if (this.state.userAgent.isMobile && !this.state.userAgent.isTablet) {
                view = '/m' + view;
            }

            let survey_url = this.query.url;
            let short_id = this.query.short_id || localStorage.getItem('short_id');

            let urlData = yield proxy({
                host: config.wechatSign.inner.host,
                port: config.wechatSign.inner.port,
                path: config.serviceUrls.wechat.answerApi.get.upstream.replace(':member_id', this.state.hcd_user.member_id)
                    .replace(':short_id', short_id)
                    .replace(':user', 'buzzbuzz')
                    .replace(':date_type', 'json'),
                method: 'GET'
            });

            console.log('---------------------');
            console.log(urlData);

            urlData = url.parse(urlData);

            let answerData = yield proxy({
                host: urlData.host,
                port: 80,
                path: urlData.path,
                method: 'GET'
            });

            console.log('---------------------');
            console.log(answerData);

            this.body = yield render.call(this, view, {
                config: config,
                base: saas.getBaseFor(this, '/'),
                survey_url: survey_url,
                answered: answerData !== '此用户尚未完成答卷,或不存在!',
                answer: answerData
            });
        })
        ;
};