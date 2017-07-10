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

            let answerData = yield proxy({
                host: config.buzz.inner.host,
                port: config.buzz.inner.port,
                path: Router.url(config.serviceUrls.buzz.survey.answerInBuzz.upstream, {
                    short_id: short_id,
                    member_id: this.state.hcd_user.member_id
                }),
                method: 'GET'
            });

            let answered = JSON.stringify(answerData) !== '"{}"';

            console.log('answerred = ', answered, ',,,', JSON.stringify(answerData));

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
        .get('/survey/help-friend/:short_id/:friend_member_id', saas.checkSaasReferer, membership.ensureAuthenticated, function* () {
            let view = '/survey';

            if (this.state.userAgent.isMobile && !this.state.userAgent.isTablet) {
                view = '/m' + view;
            }

            let answerData = yield proxy({
                host: config.buzz.inner.host,
                port: config.buzz.inner.port,
                path: Router.url(config.serviceUrls.buzz.survey.answerInBuzz.upstream, {
                    short_id: this.params.short_id,
                    member_id: this.params.friend_member_id
                }),
                method: 'GET'
            });

            this.body = yield render.call(this, view, {
                config: config,
                answer: answerData,
                base: saas.getBaseFor(this, '/')
            })
        })
        ;
};