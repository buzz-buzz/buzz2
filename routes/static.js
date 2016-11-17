const serveStatic = require('koa-static');
const koaMount = require('koa-mount');

module.exports = function (app) {
    app.use(serveStatic('public'));
    app.use(koaMount('/public/', serveStatic('public')));
    app.use(koaMount('/node_modules', serveStatic('node_modules')));
    app.use(koaMount('/resource', serveStatic('resource')));
};