'use strict';

const config = require('../../config');
const buzz = require('../../service-proxy-for-server/buzz');
const course = require('../../bll/course');
const mount = require('koa-mount');
const qs = require('querystring');
const membership = require('../../membership');
const saas = require('../../bll/saas');

module.exports = function (app, router, render) {
    router
        .get('/m/bind-mobile', saas.checkSaasReferer, function* () {
            this.body = yield render.call(this, '/m/bind-mobile', {
                config: config,
                queryString: qs.stringify(this.query),
                base: saas.getBaseFor(this, '/m/')
            });
        })
        .get('/m/my/today', saas.checkSaasReferer, membership.setHcdUserIfSignedIn, function* () {
            if (!this.state.userAgent.isMobile || this.state.userAgent.isTablet) {
                if (this.query.date && this.query.cat && this.query.level) {
                    this.redirect(saas.generateUrl(this, '/my/play?date=' + this.query.date + '&cat=' + this.query.cat + '&level=' + this.query.level), {
                        config: config
                    });
                } else {
                    this.redirect(saas.generateUrl(this, '/my/today'), { config: config, hcd_user: this.state.hcd_user });
                }
            } else {
                this.body = yield render.call(this, '/m/my/today', {
                    config: config,
                    hcd_user: this.state.hcd_user
                });
            }
        })
        .get('/m/my/play', saas.checkSaasReferer, function* () {
            this.body = yield render.call(this, '/m/my/today', {
                config: config
            });
        })
        .get('/m/player', saas.checkSaasReferer, function* () {
            this.body = yield render.call(this, '/m/player', { config: config })
        })
};