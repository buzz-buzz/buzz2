module.exports = function (app, router, render) {
    router
        .get('/my/today', function *(next) {
            this.redirect('/my/play?date=2016-11-07&cat=science&level=B');
        })
        .get('/my/history', function *(next) {
            this.body = yield render('my/history', {});
        })
        .get('/my/play', function *(next) {
            this.body = yield render('my/play', {});
        })
        .get('/my/player', function *(next) {
            this.body = yield render('my/player', {});
        })
        .get('/my/progress', function *(next) {
            this.body = yield render('my/progress', {});
        })
    ;
};