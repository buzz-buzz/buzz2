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

function* enhancedRender(view, locals) {
    return yield render(view, Object.assign({}, this.state, locals));
}

app.use(userAgent());
app.use(logger());

app.use(function* (next) {
    yield next;
    if (this.response.status === 404) {
        this.body = yield render.call(this, '404', { config: config });
        this.response.status = 404;
    }
});

require('./routes')(app, router, enhancedRender);

if (!module.parent) {
    var port = process.env.PORT || config.port || 16000;
    app.listen(port);
    console.log('Running %s site at: http://localhost:%d', config.mode, port);
}