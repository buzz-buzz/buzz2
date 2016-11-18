module.exports = function (app, router, render) {
    router
        .get('/my/today', function *(next) {
            console.log('url = ', this.request.url);
            this.redirect('/my/play?date=2016-11-07&cat=science&level=B');
        })
        .get('/my/play', function *(next) {
            console.log('url = ', this.request.url);
            this.body = yield render('my/play', {});
        })
        .get('/my/player', function *(next) {
            this.body = yield render('my/player', {});
        })
    ;
};