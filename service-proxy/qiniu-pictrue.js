/**
 * Created by hank on 2017/5/5.
 */
'use strict';

const config = require('../config');
const serviceUrls = config.serviceUrls;
const membership = require('../membership');
const request = require('request');

function pipeRequest(from, bucket) {
    return function (cb) {
        from.pipe(request.put(
            composeUrl(config.upload_qiniu.inner.host, config.upload_qiniu.inner.port, '/upload' + bucket),
            {
            },
            function (err, response, body) {
                cb(err, body);
            }));
    };
}
function composeUrl(host, port, path) {
    return 'http://' + host + ':' + port + path;
}
function uploadToBucket(bucket) {
    return function *(next) {
        if (!this.request.is('multipart/*')) return yield next;

        this.body = yield pipeRequest(this.req, bucket);
    }
}

module.exports = function (app, router, parse) {
    router
        .put(serviceUrls.buzz.picture.upload.frontEnd, uploadToBucket(serviceUrls.buzz.picture.upload.bucket))
};