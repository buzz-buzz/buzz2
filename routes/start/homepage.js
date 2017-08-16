'use strict';

const config = require('../../config');
const saas = require('../../bll/saas');
const membership = require('../../membership');
const courseList = require('../common/course-list');

module.exports = function (app, router, render) {
    router.get('/', saas.checkSaasReferer, membership.setHcdUserIfSignedIn, function* home(next) {
        this.set('Cache-Control', 'no-cache, no-store, must-revalidate');

        if (this.state.hcd_user) {
            this.redirect(saas.generateUrl(this, '/my/today'));
        } else {
            yield next;
        }
    }, courseList.render);

};