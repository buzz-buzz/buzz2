module.exports = function (app, route) {
    app.use(route.get('/api/index', function *(next) {
        this.body = 'hello';
    }));
};