'use strict';

const config = require('../config');
const buzz = require('../service-proxy-for-server/buzz');
const course = require('../bll/course');
const membership = require('../membership');

module.exports = function (app, router, render) {
    router
        .get('/my/today', membership.ensureAuthenticated, function *(next) {
            let level = config.mock ? 'A' : yield buzz.getMemberCurrentLevel(this.state.hcd_user.member_id);
            if (!level || level === 'U') {
                level = 'B';
            }

            let latestCourse = yield buzz.getLatestCourse(level);

            if (!this.state.userAgent.isMobile || this.state.userAgent.isTablet) {
                this.redirect('/my/play?date=' + latestCourse.date + '&cat=' + latestCourse.category.toLowerCase() + '&level=' + level, {
                    config: config
                });

                return;
            }

            this.redirect('/m/my/today?date=' + latestCourse.date + '&cat=' + latestCourse.category.toLowerCase() + '&level=' + level, {
                config: config
            });
        })
        .get('/my/history', membership.ensureAuthenticated, function *(next) {
            this.body = yield render('my/history', {
                config: config,
                hcd_user: this.state.hcd_user
            });
        })
        .get('/my/play', membership.setHcdUserIfSignedIn, function *(next) {
            if (!this.state.userAgent.isMobile || this.state.userAgent.isTablet) {
                return this.body = yield render('my/play', {
                    config: config,
                    hcd_user: this.state.hcd_user
                });
            }

            this.body = yield render('/m/my/today', {
                config: config,
                hcd_user: this.state.hcd_user
            });
        })
        .get('/my/player', function *(next) {
            if (this.state.userAgent.isMobile && !this.state.userAgent.isTablet) {
                this.body = yield render('m/player', {config: config});
            } else {
                this.body = yield render('my/player', {config: config});
            }
        })
        .get('/my/progress', membership.ensureAuthenticated, function *(next) {
            this.body = yield render('my/progress', {config: config});
        })
        .get('/my/account', membership.ensureAuthenticated, function *() {
            this.body = yield render('my/account', {config: config});
        })
        .get('/my/password', membership.ensureAuthenticated, function *() {
            this.body = yield render('my/password', {config: config});
        })
        .get('/my/vocabulary', membership.ensureAuthenticated, function *() {
            this.body = 'ok';
        })
    ;
};