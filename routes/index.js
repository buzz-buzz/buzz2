'use strict';

const config = require('../config');
const membership = require('../membership');
const mount = require('koa-mount');
const cookie = require('../helpers/cookie');
const coBody = require('co-body');
const fs = require('fs');
const buzz = require('../service-proxy-for-server/buzz');
const Koa = require('koa');
const saas = require('../bll/saas');
const trackingInfo = require('../bll/tracking-info');
const cacheControl = require('../bll/cache-control');

function mobileDetectRender(app, router) {
    let routes = ['/sign-in', '/sign-up', '/reset-password'];
    routes.forEach(function (route) {
        router.get(route, saas.checkSaasReferer, trackingInfo.checkReferer, function* (next) {
            cacheControl.noCache(this);
            if (this.state.userAgent.isMobile && !this.state.userAgent.isTablet) {
                this.redirect(saas.generateUrl(this, '/m' + route + this.request.search));
            } else {
                yield next;
            }
        });
    });
}

function mobileRender(app, router, render) {
    let routes = ['sign-in', 'sign-up', 'reset-password'];
    routes.forEach(function (route) {
        let routename = '/m/' + route;
        router.get(routename, saas.checkSaasReferer, require('./wechatOAuth'), function* (next) {
            console.log('=== no cache ===');
            cacheControl.noCache(this);
            this.body = yield render.call(this, routename, {
                config: config
            });
        });
    });

    router.get('/m/my/vocabulary', saas.checkSaasReferer, require('./wechatOAuth'), function* (next) {
        if (this.state.userAgent.isMobile && !this.state.userAgent.isTablet) {
            this.body = yield render.call(this, '/m/my/vocabulary', {
                config: config
            });
        } else {
            this.redirect(saas.generateUrl(this, '/vocabulary/my'), {
                config: config
            });
        }
    });
}

function simpleRender(app, router, render) {
    let routes = ['sign-in', 'reset-password'];

    for (let i = 0; i < routes.length; i++) {
        router.get('/' + routes[i], saas.checkSaasReferer, function* () {
            this.body = yield render.call(this, routes[i], {
                config: config
            });
        });
    }
}

function renderWithServerData(app, router, render) {
    router.get('/sign-up', saas.checkSaasReferer, membership.setHcdUserIfSignedIn, function* (next) {
        if (this.query.step && this.query.step == 2 && !this.state.hcd_user) {
            this.redirect(saas.generateUrl(this, '/sign-up?step=1'));
        } else {
            this.body = yield render.call(this, 'sign-up', {
                config: config,
                hcd_user: this.state.hcd_user
            });
        }
    });
}

function redirectRequest(app, router) {
    router.get('/sign-out', membership.signOut, function* deleteCookie(next) {
        cookie.deleteToken.apply(this);
        yield next;
    }, function* home(next) {
        let returnUrl = this.query.return_url;
        this.redirect(saas.generateUrl(this, returnUrl || '/sign-in'));
    });
}

function auth(app, router, render) {
    require('./my')(app, router, render);
    app.use(mount('/vocabulary', membership.ensureAuthenticated));
    require('./vocabulary')(app, router, render);
    app.use(mount('/m/my/progress', membership.ensureAuthenticated));
    app.use(mount('/m/my/my', membership.ensureAuthenticated));
    app.use(mount('/m/my/vocabulary', membership.ensureAuthenticated));
}

function admin(app, router, render) {
    app.use(mount('/admin', membership.ensureAdmin));
}

function filterConfig(config) {
    let ret = {};
    ret.cdn = config.cdn;
    ret.captcha = config.captcha.public;
    ret.serviceUrls = config.serviceUrls;
    ret.wechat = {
        returnHost: config.wechat.returnHost
    };

    return ret;
}

let clientConfig = 'angular.module("clientConfigModule", []).value("clientConfig", ' + JSON.stringify(filterConfig(config)) + ');';

function virtualFile(app, router) {
    router.get('/clientConfig.js', function* (next) {
        this.set('Cache-Control', 'public, max-age=31557600');
        this.body = clientConfig;
    });
}

function helper(app, router) {
    router
        .get('/healthcheck', function* (next) {
            this.body = {
                every: 'is ok',
                time: new Date(),
                env: process.env.NODE_ENV
            };
        })
        .get('/whoami', membership.setHcdUserFromCookie, function* (next) {
            this.body = this.state.hcd_user;
        });
}

function serviceProxy(app, router) {
    require('./api')(app, router);
    require('../service-proxy/sso')(app, router, coBody);
    require('../service-proxy/sms')(app, router, coBody);
    require('../service-proxy/buzz')(app, router, coBody);
    require('../service-proxy/video')(app, router, coBody);
    require('../service-proxy/exercise')(app, router, coBody);
    require('../service-proxy/share')(app, router, coBody);
    require('../service-proxy/wechatSign')(app, router, coBody);
    require('../service-proxy/progress')(app, router, coBody);
    require('../service-proxy/qiniu-picture')(app, router, coBody);
}

function staticFiles(app, router) {
    require('./static')(app, router);
}

function oauth(app, router, render) {
    require('./wechat')(app, router, render);
}

function routeFolder(folder, app, router, render, server) {
    fs.readdir(__dirname + `/${folder}`, function (err, results) {
        if (err) {
            throw err;
        }

        results.forEach(fileName => {
            require(`./${folder}/` + fileName)(app, router, render, server);
        });
    });
}

function more(app, router, render, server) {
    routeFolder('more', app, router, render, server);
    routeFolder('secure', app, router, render, server);
}

function start(app, router, render) {
    routeFolder('start', app, router, render);
}

module.exports = function (app, router, render, server) {
    start(app, router, render);
    helper(app, router);
    staticFiles(app, router);
    virtualFile(app, router);
    mobileDetectRender(app, router);
    redirectRequest(app, router);
    serviceProxy(app, router);
    mobileRender(app, router, render);
    simpleRender(app, router, render);
    renderWithServerData(app, router, render);
    auth(app, router, render);
    admin(app, router, render);
    oauth(app, router, render);
    more(app, router, render, server);

    app
        .use(router.routes())
        .use(router.allowedMethods());

    const saasKoa = new Koa();
    saasKoa
        .use(function* (next) {
            this.state.saas = true;
            this.state.sassBase = '/saas';
            yield next;
        })
        .use(router.routes())
        .use(router.allowedMethods());

    app.use(mount('/saas', saasKoa));
};