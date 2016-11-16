'use strict';

const koa = require('koa');
const app = module.exports = koa();
const config = require('./config');
const path = require('path');
const fs = require('fs');
const route = require('koa-route');
const logger = require('koa-logger');
const serveStatic = require('koa-static');
const koaMount = require('koa-mount');
const views = require('co-views');
const parse = require('co-body');

const render = views(path.join(__dirname, 'views'), {default: 'pug'});

app.use(logger());

app.use(serveStatic('public'));
app.use(koaMount('/public/', serveStatic('public')));
app.use(koaMount('/node_modules', serveStatic('node_modules')));
app.use(serveStatic('resource'));
app.use(koaMount('/resource', serveStatic('resource')));

let routesPath = path.join(__dirname, 'routes');
fs.readdirSync(routesPath).forEach(function (file) {
    if (file[0] === '.') return;
    require(routesPath + '/' + file)(app, require('koa-route'), render);
});

routesPath = path.join(__dirname, 'service-proxy');
fs.readdirSync(routesPath).forEach(function (file) {
    if (file[0] === '.') return;

    require(routesPath + '/' + file)(app, require('koa-route'), parse);
});

app.use(route.get('/', function *home(next) {
    this.redirect('/play.html?date=2016-11-07&cat=science&level=B');
}));

app.use(route.get('/env', function *(next) {
    this.body = JSON.stringify({});
}));

app.use(route.get('/healthcheck', function*(next) {
    this.body = {every: 'is ok', time: new Date()};
}));

app.use(route.get('/clientConfig.js', function *(next) {
    function filterConfig(config) {
        let ret = {};
        ret.cdn = config.cdn;
        ret.serviceUrls = config.serviceUrls;

        return ret;
    }

    this.body = 'angular.module("clientConfigModule", []).value("clientConfig", ' + JSON.stringify(filterConfig(config)) + ');';
}));

if (!module.parent) {
    var port = process.env.PORT || config.port || 16000;
    app.listen(port);
    console.log('Running %s site at: http://localhost:%d', config.mode, port);
}