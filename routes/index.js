'use strict';

const config = require('../config');
const membership = require('../membership');
const mount = require('koa-mount');

function simpleRender(app, router, render) {
    let routes = ['sign-in', 'agreement', 'reset-password'];

    for (let i = 0; i < routes.length; i++) {
        router.get('/' + routes[i], function *(next) {
            this.body = yield render(routes[i], {});
        });
    }
}
function renderWithServerData(app, router, render) {
    router.get('/sign-up', membership.setHcdUser, function *(next) {
        if (this.query.step && this.query.step == 2 && !this.state.hcd_user) {
            this.redirect('/sign-up?step=1');
        } else {
            this.body = yield render('sign-up', {
                hcd_user: this.state.hcd_user
            });
        }
    });
}
function redirect(app, router) {
    router.get('/', function *home(next) {
        this.redirect('/my/today');
    });
}
function auth(app, router, render) {
    app.use(mount('/my', membership.ensureAuthenticated));

    require('./my')(app, router, render);

    app.use(mount('/vocabulary', membership.ensureAuthenticated));

    require('./vocabulary')(app, router, render);
}

function virtualFile(app, router) {
    router.get('/clientConfig.js', function *(next) {
        function filterConfig(config) {
            let ret = {};
            ret.cdn = config.cdn;
            ret.captcha = config.captcha.public;
            ret.serviceUrls = config.serviceUrls;

            return ret;
        }

        this.body = 'angular.module("clientConfigModule", []).value("clientConfig", ' + JSON.stringify(filterConfig(config)) + ');';
    });
}

function helper(app, router) {
    router.get('/healthcheck', function*(next) {
        this.body = {every: 'is ok', time: new Date()};
    });

    router.get('/whoami', membership.setHcdUser, function *(next) {
        this.body = this.state.hcd_user;
    });
}
function serviceProxy(app, router) {
    require('../service-proxy/sso')(app, router, require('co-body'));
    require('../service-proxy/sms')(app, router, require('co-body'));
}
function staticFiles(app) {
    require('./static')(app);
}
module.exports = function (app, router, render) {
    helper(app, router);
    staticFiles(app);
    virtualFile(app, router);
    redirect(app, router);
    serviceProxy(app, router);
    simpleRender(app, router, render);
    renderWithServerData(app, router, render);
    auth(app, router, render);

    app
        .use(router.routes())
        .use(router.allowedMethods());
};