'use strict';

const config = require('../config');
const buzz = require('../service-proxy-for-server/buzz');

module.exports = function (app, router, render) {
    router
        .get('/my/today', function *(next) {
            let level = yield buzz.getMemberCurrentLevel(this.state.hcd_user.member_id);
            if (level === 'U') {
                level = 'B';
            }

            this.redirect('/my/play?date=2016-11-07&cat=science&level=' + level, {
                config: config
            });
        })
        .get('/my/history', function *(next) {
            this.body = yield render('my/history', {});
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