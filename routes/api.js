module.exports = function (app, route) {
    route.get('/api/index', function *(next) {
        this.body = 'hello';
    });
};