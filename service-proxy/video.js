'use strict';

const config = require('../config');
const membership = require('../membership');
const proxy = require('./proxy');
const video = require('../bll/video');

const proxyOption = {
    host: config.buzz.inner.host,
    port: config.buzz.inner.port,
};

module.exports = function (app, router, parse) {
    router
        .get('/service-proxy/video/playable', membership.setHcdUserIfSignedIn, video.playable)
        .get('/service-proxy/buzz/video/subtitle-list', membership.setHcdUserIfSignedIn, function* () {
            this.body = yield proxy(Object.assign({
                path: '/video/subtitle-list',
                method: 'GET'
            }, proxyOption));
        })
    ;
};