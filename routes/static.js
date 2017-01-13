const serveStatic = require('koa-static');
const koaMount = require('koa-mount');
const proxy = require('../service-proxy/proxy');

let staticSetting = {
    etag: true,
    maxage: 1000 * 3600 * 24 * 30,
    gzip: true
};

module.exports = function (app) {
    app.use(serveStatic('public', staticSetting));
    app.use(koaMount('/public/', serveStatic('public', staticSetting)));
    app.use(koaMount('/mock/', serveStatic('mock', staticSetting)));
    app.use(koaMount('/node_modules', serveStatic('node_modules', staticSetting)));
    if (process.env.NODE_ENV !== 'prd') {
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