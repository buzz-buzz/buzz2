'use strict';

const config = require('../config');
const membership = require('../membership');
const proxy = require('./proxy');
const video = require('../bll/video');

module.exports = function (app, router, parse) {
    router
        .get('/service-proxy/video/playable', membership.setHcdUserIfSignedIn, video.playable)
    ;
};