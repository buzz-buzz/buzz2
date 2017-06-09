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
                this.body = yield render('/m/player', { config: config });
            } else {
                this.body = yield render('my/player', { config: config });
            }
        })
        .get('/s/ad/:trk_tag?', saas.checkSaasReferer, function* () {
            if (!this.query.trk_tag) {
                this.redirect(saas.generateUrl(this, `/s/ad?trk_tag=${this.params.trk_tag}`));
            } else {
                this.body = yield render('ad', { config: config, trk_tag: this.query.trk_tag });
            }
        }).get('/agreement', saas.checkSaasReferer, function* () {
            this.body = yield render('/agreement', { config: config });
        })
        ;
};
