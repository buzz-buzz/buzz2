'use strict';

const koa = require('koa');
const app = module.exports = koa();
const config = require('./config');
const path = require('path');
const fs = require('fs');
const router = require('koa-router')();
const logger = require('koa-logger');
const views = require('co-views');
const userAgent = require('koa-useragent');

const render = views(path.join(__dirname, 'views'), {
    default: "pug",
    extension: "pug",
    map: {
        "html": "underscore"
    }
});

app.use(userAgent());
app.use(logger());

require('./routes')(app, router, render);

if (!module.parent) {
    var port = process.env.PORT || config.port || 16000;
    app.listen(port);
    console.log('Running %s site at: http://localhost:%d', config.mode, port);
}