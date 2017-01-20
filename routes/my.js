'use strict';

const config = require('../config');
const buzz = require('../service-proxy-for-server/buzz');
const course = require('../bll/course');

module.exports = function (app, router, render) {
    router
        .get('/my/today', function *(next) {
            let level = config.mock ? 'A' : yield buzz.getMemberCurrentLevel(this.state.hcd_user.member_id);
            if (!level || level === 'U') {
                level = 'B';
            }

            let latestCourse = yield buzz.getLatestCourse(level);

            this.redirect('/my/play?date=' + latestCourse.date + '&cat=' + latestCourse.category.toLowerCase() + '&level=' + level, {
                config: config
            });
        })
        .get('/my/history', function *(next) {
            let hcd_user = this.state.hcd_user;

            this.body = yield render('my/history', {
                config: config,
                hcd_user: hcd_user
            });
        })
        .get('/my/play', function *(next) {
            this.body = yield render('my/play', {
                config: config
            });
        })
        .get('/my/player', function *(next) {
            this.body = yield render('my/player', {config: config});
        })
        .get('/my/progress', function *(next) {
            this.body = yield render('my/progress', {config: config});
        })
    ;
};