module.exports = function (app, route, render) {
    app.use(route.get('/my/today', function *(next) {
        this.redirect('/play.html?date=2016-11-07&cat=science&level=B');
    }));
};