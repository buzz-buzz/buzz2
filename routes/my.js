'use strict';

const config = require('../config');
const buzz = require('../service-proxy-for-server/buzz');
const course = require('../bll/course');
const membership = require('../membership');

module.exports = function (app, router, render) {
    router
        .get('/my/today', membership.ensureAuthenticated, function* (next) {
            let level = config.mock ? 'A' : yield buzz.getMemberCurrentLevel(this.state.hcd_user.member_id);
            if (!level || level === 'U') {
                level = 'B';
            }

            let latestCourse = yield buzz.getLatestCourseFor(this.state.hcd_user.member_id, level);

            if (!latestCourse) {
                this.throw(500, 'failed to fetch latest course');
            }

            if(!this.state.hcd_user.member_id){
                this.redirect('/my/history',{config: config});
                return;
            }

            if (!this.state.userAgent.isMobile || this.state.userAgent.isTablet) {
                this.redirect('/my/play?date=' + latestCourse.date + '&cat=' + (latestCourse.category || '').toLowerCase() + '&level=' + level, {
                    config: config
                });
                return;
            }

            this.redirect('/m/my/today?date=' + latestCourse.date + '&cat=' + latestCourse.category.toLowerCase() + '&level=' + level, {
                config: config
            });
        })
        .get('/my/history', function* (next) {
            if (!this.state.userAgent.isMobile || this.state.userAgent.isTablet) {
                this.body = yield render('my/history', {
                    config: config,
                    hcd_user: this.state.hcd_user
                });
            } else {
                this.redirect('/my/mobile-history', { config: config });
            }
        })
        .get('/my/play', membership.setHcdUserIfSignedIn, function* (next) {
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
        .get('/my/player', function* (next) {
            if (this.state.userAgent.isMobile && !this.state.userAgent.isTablet) {
                this.body = yield render('m/player', { config: config });
            } else {
                this.body = yield render('my/player', { config: config });
            }
        })
        .get('/my/progress', membership.ensureAuthenticated, function* (next) {
            if (!this.state.userAgent.isMobile || this.state.userAgent.isTablet) {
                this.body = yield render('my/progress', { config: config });
            } else {
                this.redirect('/my/mobile-history', { config: config });
            }
        })
        .get('/my/account', membership.ensureAuthenticated, function* () {
            if (!this.state.userAgent.isMobile || this.state.userAgent.isTablet) {
                this.body = yield render('my/account', { config: config });
            } else {
                this.redirect('/m/my/my', { config: config });
            }
        })
        .get('/my/password', membership.ensureAuthenticated, function* () {
            this.body = yield render('my/password', { config: config });
        })
        .get('/my/vocabulary', membership.ensureAuthenticated, function* () {
            if (!this.state.userAgent.isMobile || this.state.userAgent.isTablet) {
                this.body = yield render('vocabulary/vocabulary', { config: config });
            } else {
                this.redirect('/m/my/vocabulary', { config: config });
            }
        })
        .get('/my/weekly-quiz', membership.ensureAuthenticated, function* () {
            this.body = yield render('my/weekly-quiz', { config: config, base: '/my/' });
        })
        .get('/my/daily-exercise', membership.ensureAuthenticated, function* () {
            this.body = yield render('m/daily-exercise', { config: config, base: '/my/' });
        })
        .get('/my/today-vocabulary', membership.ensureAuthenticated, function* () {
            this.body = yield render('m/vocabulary', { config: config, base: '/my/' });
        })

        .get('/my/avatar', membership.ensureAuthenticated, function* () {
            this.body = yield render('m/my/avatar-mobile', { config: config, base: '/my/', title: '头像', backUrl: 'javascript:location.href="/m/my/my"' });
        })
        .get('/my/mobile-history',function* () {
            if (!this.state.userAgent.isMobile || this.state.userAgent.isTablet) {
                this.redirect('/my/history', { config: config });
            } else {
                this.body = yield render('m/history', { config: config, base: '/my/', title: 'history'});
            }
        })
        ;
};