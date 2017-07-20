'use strict';

const config = require('../config');
const buzz = require('../service-proxy-for-server/buzz');
const course = require('../bll/course');
const membership = require('../membership');
const saas = require('../bll/saas');
const courseList = require('./common/course-list');

module.exports = function (app, router, render) {
    router
        .get('/my/today', saas.checkSaasReferer, membership.ensureAuthenticated, function* (next) {
            if (!this.state.hcd_user.member_id) {
                this.redirect(saas.generateUrl(this, '/my/history'), {
                    config: config
                });
                return;
            }

            let level = config.mock ? 'A' : yield buzz.getMemberCurrentLevel(this.state.hcd_user.member_id);
            if (!level || level === 'U') {
                level = 'B';
            }

            let latestCourse = yield buzz.getLatestCourseFor(this.state.hcd_user.member_id, level);

            if (!latestCourse) {
                this.throw(500, 'failed to fetch latest course');
            }

            if (!this.state.userAgent.isMobile || this.state.userAgent.isTablet) {
                this.redirect(saas.generateUrl(this, '/my/play?date=' + latestCourse.date + '&cat=' + (latestCourse.category || '').toLowerCase() + '&level=' + level), {
                    config: config
                });
                return;
            }

            this.redirect(saas.generateUrl(this, '/m/my/today?date=' + latestCourse.date + '&cat=' + latestCourse.category.toLowerCase() + '&level=' + level), {
                config: config
            });
        })
        .get('/my/history', saas.checkSaasReferer, courseList.render)
        .get('/my/play', saas.checkSaasReferer, membership.setHcdUserIfSignedIn, function* (next) {
            if (!this.state.userAgent.isMobile || this.state.userAgent.isTablet) {
                return this.body = yield render.call(this, 'my/play', {
                    config: config,
                    hcd_user: this.state.hcd_user
                });
            }

            this.body = yield render.call(this, '/m/my/today', {
                config: config,
                hcd_user: this.state.hcd_user
            });
        })
        .get('/my/player', saas.checkSaasReferer, function* (next) {
            if (this.state.userAgent.isMobile && !this.state.userAgent.isTablet) {
                this.body = yield render.call(this, 'm/player', {
                    config: config
                });
            } else {
                this.body = yield render.call(this, 'my/player', {
                    config: config
                });
            }
        })
        .get('/my/progress', saas.checkSaasReferer, membership.ensureAuthenticated, function* (next) {
            if (!this.state.userAgent.isMobile || this.state.userAgent.isTablet) {
                this.body = yield render.call(this, 'my/progress', {
                    config: config
                });
            } else {
                this.body = yield render.call(this, '/m/my/progress', {
                    config: config
                });
            }
        })
        .get('/my/account', saas.checkSaasReferer, membership.ensureAuthenticated, function* () {
            if (!this.state.userAgent.isMobile || this.state.userAgent.isTablet) {
                this.body = yield render.call(this, 'my/account', {
                    config: config
                });
            } else {
                this.body = yield render.call(this, '/m/my/my', {
                    config: config
                });
            }
        })
        .get('/my/password', saas.checkSaasReferer, membership.ensureAuthenticated, function* () {
            this.body = yield render.call(this, 'my/password', {
                config: config
            });
        })
        .get('/my/vocabulary', saas.checkSaasReferer, membership.ensureAuthenticated, function* () {
            if (!this.state.userAgent.isMobile || this.state.userAgent.isTablet) {
                this.body = yield render.call(this, 'vocabulary/vocabulary', {
                    config: config
                });
            } else {
                this.body = yield render.call(this, '/m/my/vocabulary', {
                    config: config
                });
            }
        })
        .get('/my/weekly-quiz', saas.checkSaasReferer, membership.ensureAuthenticated, function* () {
            this.body = yield render.call(this, 'my/weekly-quiz', {
                config: config,
                base: saas.getBaseFor(this, '/my/')
            });
        })
        .get('/my/daily-exercise', saas.checkSaasReferer, membership.ensureAuthenticated, function* () {
            this.body = yield render.call(this, 'm/daily-exercise', {
                config: config,
                base: saas.getBaseFor(this, '/my/')
            });
        })
        .get('/my/today-vocabulary', saas.checkSaasReferer, membership.ensureAuthenticated, function* () {
            this.body = yield render.call(this, 'm/vocabulary', {
                config: config,
                base: saas.getBaseFor(this, '/my/')
            });
        })

        .get('/my/avatar', saas.checkSaasReferer, membership.ensureAuthenticated, function* () {
            this.body = yield render.call(this, 'm/my/avatar-mobile', {
                config: config,
                base: saas.getBaseFor(this, '/my/'),
                title: '头像',
                backUrl: 'javascript:location.href="/my/account"'
            });
        })
        .get('/my/mobile-history', saas.checkSaasReferer, membership.setHcdUserIfSignedIn, function* () {
            if (!this.state.userAgent.isMobile || this.state.userAgent.isTablet) {
                this.redirect(saas.generateUrl(this, '/my/history'), {
                    config: config
                });
            } else {
                this.body = yield render.call(this, 'm/history', {
                    config: config,
                    hcd_user: this.state.hcd_user,
                    base: saas.getBaseFor(this, '/my/'),
                    title: 'Buzzbuzz English',
                    backUrl: 'javascript:location.href="/"'
                });
            }
        })
        .get('/my/paid-course', saas.checkSaasReferer, membership.ensureAuthenticated, function* () {
            this.body = yield render.call(this, 'm/my/my-paid-course', {
                config: config,
                base: saas.getBaseFor(this, '/my/'),
                title: '我的预定课程',
                backUrl: 'javascript:location.href="/my/account"'
            });
        })
        .get('/my/user-account', saas.checkSaasReferer, membership.ensureAuthenticated, function* () {
            this.body = yield render.call(this, 'm/my/user-account', {
                config: config,
                base: saas.getBaseFor(this, '/my/'),
                title: '我的钱包',
                backUrl: 'javascript:location.href="/my/account"'
            });
        });
};