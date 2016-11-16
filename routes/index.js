'use strict';

module.exports = function (app, route, render) {
    let routes = ['sign-up', 'sign-in', 'agreement', 'reset-password'];

    for (let i = 0; i < routes.length; i++) {
        app.use(route.get('/' + routes[i], function *(next) {
            this.body = yield render(routes[i], {});
        }));
    }

    app.use(route.get('/my', function *(next) {
        if (this.state.hcd_user) {
            this.redirect('/');
        } else {
            this.redirect('/sign-in?return_url=' + encodeURIComponent(this.request.href));
        }
    }));
};