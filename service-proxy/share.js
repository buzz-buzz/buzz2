'use strict';

const config = require('../config');
const membership = require('../membership');
const share = require('../bll/share');

module.exports = function (app, router, parse) {
    router
        .get(config.serviceUrls.buzz.share.myLink, membership.setHcdUserIfSignedIn, share.getMyLink)
    ;
};