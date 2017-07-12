'use strict';

const config = require('../../config');
const buzz = require('../../service-proxy-for-server/buzz');
const course = require('../../bll/course');
const mount = require('koa-mount');
const saas = require('../../bll/saas');

module.exports = function (app, router, render) {
    router
        .get('/s/player', saas.checkSaasReferer, function* () {
            if (this.state.userAgent.isMobile && !this.state.userAgent.isTablet) {
                this.body = yield render.call(this, '/m/player', { config: config });
            } else {
                this.body = yield render.call(this, 'my/player', { config: config });
            }
        })
        .get('/s/ad/:trk_tag?', saas.checkSaasReferer, function* () {
            if (!this.query.trk_tag) {
                this.redirect(saas.generateUrl(this, `/s/ad?trk_tag=${this.params.trk_tag}`));
            } else {
                this.body = yield render.call(this, 'ad', { config: config, trk_tag: this.query.trk_tag });
            }
        })
        .get('/agreement', saas.checkSaasReferer, function* () {
            let view = '/agreement';

            if (this.state.userAgent.isMobile && !this.state.userAgent.isTablet) {
                view = '/m' + view;
            }

            this.body = yield render.call(this, view, {
                config: config,
                base: saas.getBaseFor(this, '/'),
                title: 'Buzzbuzz 用户协议',
                backUrl: 'javascript:location.href="/sign-up"'
            });
        })
        .get('/video', saas.checkSaasReferer, function* () {
            this.body = yield render.call(this, '/m/video', {
                config: config,
                base: saas.getBaseFor(this, '/'),
                title: 'video demo'
            })
        })
        ;
};
