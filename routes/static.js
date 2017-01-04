const serveStatic = require('koa-static');
const koaMount = require('koa-mount');
const proxy = require('../service-proxy/proxy');

module.exports = function (app) {
    app.use(serveStatic('public'));
    app.use(koaMount('/public/', serveStatic('public')));
    app.use(koaMount('/mock/', serveStatic('mock')));
    app.use(koaMount('/node_modules', serveStatic('node_modules')));
    if (process.env.NODE_ENV === 'prd') {
        app.use(koaMount('/resources', serveStatic('resources')));
    } else {
        app.use(koaMount('/resources', function *(next) {
            this.body = yield proxy({
                host: 'www.buzzbuzzenglish.com',
                port: 80,
                path: '/resources' + this.request.url,
                method: 'GET'
            });
        }));
    }
};