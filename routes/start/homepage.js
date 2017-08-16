'use strict';

const config = require('../../config');
const saas = require('../../bll/saas');
const membership = require('../../membership');
const courseList = require('../common/course-list');
const cacheControl = require('../../bll/cache-control');
const trackingInfo = require('../../bll/tracking-info');

module.exports = function (app, router, render) {
    router.get('/', saas.checkSaasReferer, membership.setHcdUserIfSignedIn, trackingInfo.checkReferer, function* home(next) {
        cacheControl.noCache(this);

        if (this.state.hcd_user) {
            this.redirect(saas.generateUrl(this, `/my/today?${this.request.querystring}`));
        } else {
            yield next;
        }
    }, courseList.render);

};