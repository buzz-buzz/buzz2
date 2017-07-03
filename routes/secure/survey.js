'use strict';

const config = require('../../config');
const saas = require('../../bll/saas');
const membership = require('../../membership');

module.exports = function (app, router, render) {
    router
        .get('/survey', saas.checkSaasReferer, membership.ensureAuthenticated, function*() {
            let view = '/survey';

            if (this.state.userAgent.isMobile && !this.state.userAgent.isTablet) {
                view = '/m' + view;
            }

            this.body = yield render.call(this, view, {
                config: config,
                base: saas.getBaseFor(this, '/'),
                survey_url: this.query.url
            });
        })
    ;
};