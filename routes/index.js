'use strict';

const config = require('../config');
const membership = require('../membership');
const mount = require('koa-mount');

module.exports = function (app, route, render) {
    let routes = ['sign-up', 'sign-in', 'agreement', 'reset-password'];

    for (let i = 0; i < routes.length; i++) {
        app.use(route.get('/' + routes[i], function *(next) {
            this.body = yield render(routes[i], {});
        }));
    }

    app.use(mount('/my', membership.ensureAuthenticated));

    require('./my')(app, route, render);
};