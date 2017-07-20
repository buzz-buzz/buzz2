'use strict';

const config = require('../../config');
const saas = require('../../bll/saas');
const membership = require('../../membership');
const proxy = require('../../service-proxy/proxy');
const surveyBll = require('../../bll/survey');
const Router = require('koa-router');
const greenSharedLogger = require('../../common/logger')('/routes/secure/survey.js');

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
                        redirect: encodeURIComponent(`${config.wechat.returnHost}/jumpresult?short_id=${this.query.short_id}`)
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
                answer: answerData,
                title: '我的话题'
            });
        })
        .get('/survey/help-friend/:short_id/:friend_member_id', saas.checkSaasReferer, membership.ensureAuthenticated, function* () {
            let view = '/survey';

            if (this.state.userAgent.isMobile && !this.state.userAgent.isTablet) {
                view = '/m' + view;
            }

            let my_answerData = yield proxy({
                host: config.buzz.inner.host,
                port: config.buzz.inner.port,
                path: Router.url(config.serviceUrls.buzz.survey.answerInBuzz.upstream, {
                    short_id: this.params.short_id,
                    member_id: this.state.hcd_user.member_id
                }),
                method: 'GET'
            });

            let answered = JSON.stringify(my_answerData) !== '"{}"';

            if (answered) {
                this.redirect(saas.generateUrl(this, '/survey?short_id=' + this.params.short_id));
            } else {
                let answerData = yield proxy({
                    host: config.buzz.inner.host,
                    port: config.buzz.inner.port,
                    path: Router.url(config.serviceUrls.buzz.survey.answerInBuzz.upstream, {
                        short_id: this.params.short_id,
                        member_id: this.params.friend_member_id
                    }),
                    method: 'GET'
                });

                let friendName = yield proxy({
                    host: config.sso.inner.host,
                    port: config.sso.inner.port,
                    path: Router.url(config.serviceUrls.sso.profile.load.upstream.replace(':member_id', this.params.friend_member_id), {}),
                    method: 'GET'
                });

                friendName = JSON.parse(friendName).result.display_name || JSON.parse(friendName).result.real_name || '朋友';

                this.body = yield render.call(this, view, {
                    config: config,
                    answer: answerData,
                    base: saas.getBaseFor(this, '/'),
                    title: friendName + '的邀请'
                })
            }
        })
        .get('/jumpresult', membership.ensureAuthenticated, function* () {
            //  called by wenjun ==========>>>>>>>>> /jumpresult?short_id=yiA3Yv

            // greenSharedLogger.error('called by wenjun ==========>>>>>>>>> ' + this.req.url);

            if (this.query.short_id) {
                let r = yield proxy(Object.assign({
                    path: config.serviceUrls.buzz.survey.answer.upstream,
                    method: 'PUT',
                    data: {
                        member_id: this.state.hcd_user.member_id,
                        short_id: this.query.short_id,
                        wj_user: 'buzzbuzz',
                        data_type: 'json'
                    }
                }, {
                    host: config.buzz.inner.host,
                    port: config.buzz.inner.port,
                }));
            }

            this.body = yield render.call(this, '/result-callback', {
                config: config
            });
        });
};