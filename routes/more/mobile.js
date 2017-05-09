'use strict';

const config = require('../../config');
const buzz = require('../../service-proxy-for-server/buzz');
const course = require('../../bll/course');
const mount = require('koa-mount');
const qs = require('querystring');
const membership = require('../../membership');

module.exports = function (app, router, render) {
    router
        .get('/m/bind-mobile', function *() {
            this.body = yield render('/m/bind-mobile', {
                config: config,
                queryString: qs.stringify(this.query),
                base: '/m/'
            });
        })
        .get('/m/my/today', membership.setHcdUserIfSignedIn, function *() {
            if (!this.state.userAgent.isMobile || this.state.userAgent.isTablet) {
                if (this.query.date && this.query.cat && this.query.level) {
                    this.redirect('/my/play?date=' + this.query.date + '&cat=' + this.query.cat + '&level=' + this.query.level, {
                        config: config
                    });
                } else {
                    this.redirect('/my/today', {config: config, hcd_user: this.state.hcd_user});
                }
            } else {
                this.body = yield render('/m/my/today', {
                    config: config,
                    hcd_user: this.state.hcd_user
                });
            }
        })
        .get('/m/my/play', function *() {
            this.body = yield render('/m/my/today', {
                config: config
            });
        })
        .get('/m/player', function*() {
            this.body = yield render('/m/player', {config: config})
        })
        .get('/m/my/my', membership.ensureAuthenticated, function *() {
            if (!this.state.userAgent.isMobile || this.state.userAgent.isTablet) {
                this.redirect('/my/account', {config: config});
            } else {
                this.body = yield render('/m/my/my', {config: config});
            }
        })
        .get('/m/my/progress', membership.ensureAuthenticated, function *() {
            if (this.state.userAgent.isMobile && !this.state.userAgent.isTablet) {
                this.body = yield render('/m/my/progress', {config: config});
            }else {
                this.redirect('/my/progress',{config: config});
            }
        })
};