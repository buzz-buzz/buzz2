'use strict';

const config = require('../config');
const membership = require('../membership');
const mount = require('koa-mount');
const cookie = require('../helpers/cookie');
const coBody = require('co-body');
const fs = require('fs');

function mobileDetectRender(app, router, render) {
    let routes = ['sign-in', 'sign-up', 'reset-password'];
    routes.forEach(function (route) {
        let routename = '/' + route;
        router.get(routename, function *(next) {
            if (this.state.userAgent.isMobile) {
                this.redirect('/m/' + route + this.request.search);
            } else {
                yield next;
            }
        });
    });
}

function mobileRender(app, router, render) {
    let routes = ['sign-in', 'loading', 'sign-up', 'reset-password'];
    routes.forEach(function (route) {
        let routename = '/m/' + route;
        router.get(routename, require('./wechatOAuth'), function *(next) {
            this.body = yield render(routename, {
                config: config
            });
        });
    });
}

function simpleRender(app, router, render) {
    let routes = ['sign-in', 'loading', 'agreement', 'reset-password'];

    for (let i = 0; i < routes.length; i++) {
        router.get('/' + routes[i], function *(next) {
            this.body = yield render(routes[i], {
                config: config
            });
        });
    }
}
function renderWithServerData(app, router, render) {
    router.get('/sign-up', membership.setHcdUserByToken, function *(next) {
        if (this.query.step && this.query.step == 2 && !this.state.hcd_user) {
            this.redirect('/sign-up?step=1');
        } else {
            this.body = yield render('sign-up', {
                hcd_user: this.state.hcd_user,
                config: config
            });
        }
    });
}
function redirectRequest(app, router) {
    router.get('/', function *home(next) {
        if (this.state.userAgent.isMobile) {
            this.redirect('/m/loading?url=/my/today');
        } else {
            this.redirect('/my/today');
        }
    });

    router.get('/sign-out', function *deleteCookie(next) {
        cookie.deleteToken.apply(this);
        yield next;
    }, function *home(next) {
        this.redirect('/sign-in');
    });
}
function auth(app, router, render) {
    app.use(mount('/my', membership.ensureAuthenticated));

    require('./my')(app, router, render);

    app.use(mount('/vocabulary', membership.ensureAuthenticated));

    require('./vocabulary')(app, router, render);

    app.use(mount('/exercise', membership.ensureAuthenticated));

    require('./exercise')(app, router, render);
}

function admin(app, router, render) {
    app.use(mount('/admin', membership.ensureAdmin));
}

function api(app, router, render) {
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
    router
        .get('/healthcheck', function*(next) {
            this.body = {every: 'is ok', time: new Date(), env: process.env.NODE_ENV};
        })
        .get('/whoami', membership.setHcdUserByToken, function *(next) {
            this.body = this.state.hcd_user;
        })
    ;
}
function serviceProxy(app, router) {
    require('../service-proxy/sso')(app, router, coBody);
    require('../service-proxy/sms')(app, router, coBody);
    require('../service-proxy/buzz')(app, router, coBody);
}
function staticFiles(app) {
    require('./static')(app);
}
function oauth(app, router, render) {
    require('./wechat')(app, router, render);
}
function more(app, router, render) {
    fs.readdir(__dirname + '/more', function (err, results) {
        if (err) {
            throw err;
        }

        results.forEach(fileName => {
            require('./more/' + fileName)(app, router, render);
        });
    });
}

module.exports = function (app, router, render) {
    helper(app, router);
    staticFiles(app);
    virtualFile(app, router);
    mobileDetectRender(app, router);
    redirectRequest(app, router);
    serviceProxy(app, router);
    mobileRender(app, router, render);
    simpleRender(app, router, render);
    renderWithServerData(app, router, render);
    auth(app, router, render);
    api(app, router, render);
    admin(app, router, render);
    oauth(app, router, render);
    // more(app, router, render);

    app
        .use(router.routes())
        .use(router.allowedMethods());
};