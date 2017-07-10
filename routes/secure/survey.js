'use strict';

const config = require('../../config');
const saas = require('../../bll/saas');
const membership = require('../../membership');
const proxy = require('../../service-proxy/proxy');
const surveyBll = require('../../bll/survey');
const Router = require('koa-router');

module.exports = function (app, router, render) {
    router
        .get('/survey', saas.checkSaasReferer, membership.ensureAuthenticated, function* () {
            let view = '/survey';
            let source = 'computer';

            if (this.state.userAgent.isMobile && !this.state.userAgent.isTablet) {
                view = '/m' + view;
                source = 'mobile';
            }

            let short_id = this.query.short_id;

            let urlData = yield proxy({
                host: config.wechatSign.inner.host,
                port: config.wechatSign.inner.port,
                path: config.serviceUrls.wechat.answerApi.get.upstream.replace(':member_id', this.state.hcd_user.member_id)
                    .replace(':short_id', short_id)
                    .replace(':user', 'buzzbuzz')
                    .replace(':date_type', 'json'),
                method: 'GET'
            });

            let answerData = yield proxy({
                url: urlData,
                method: 'GET'
            });

            let answered = answerData !== '此用户尚未完成答卷,或不存在!';

            let survey_url = '';
            if (!answered) {
                survey_url = yield proxy({
                    host: config.wechatSign.inner.host,
                    port: config.wechatSign.inner.port,
                    path: Router.url('/survey/callback/url/:member_id/:short_id/:user/:callback/:redirect/:test?', {
                        member_id: this.state.hcd_user.member_id,
                        short_id: this.query.short_id,
                        user: 'buzzbuzz',
                        callback: encodeURIComponent(`${config.wechat.returnHost}/service-proxy/surveys/answers`),
                        redirect: encodeURIComponent(`${config.wechat.returnHost}/jumpresult`)
                    }),
                    method: 'GET'
                });
            }

            this.body = yield render.call(this, view, {
                config: config,
                base: saas.getBaseFor(this, '/'),
                survey_url: survey_url,
                source: source,
                answered: answered,
                answer: answerData
            });
        })
        ;
};