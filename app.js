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
const greenSharedLogger = require('./common/logger')('app.js');
const cookies = require('./helpers/cookie.js');
const membership = require('./membership/index.js');

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
    console.log(this.query.token);
    if (this.query.token) {
        let result = yield membership.parseTokenAndSetHcdUser(this, this.query.token);
        cookies.resetSignOnCookies.call(this, Object.assign({}, result, { token: this.query.token }));
    }

    yield next;
});

app.on('error', function (err, ctx) {
    greenSharedLogger.error(err);
});


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