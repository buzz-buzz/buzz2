module.exports = function (app, router, render) {
    router
        .get('/exercise/my', function *(next) {
            this.body = yield render('exercise/index.html', {});
        })
    ;
};