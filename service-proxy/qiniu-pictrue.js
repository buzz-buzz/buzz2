/**
 * Created by hank on 2017/5/5.
 */
'use strict';

const config = require('../config');
const serviceUrls = config.serviceUrls;
const membership = require('../membership');
const proxy = require('./proxy');
const parse = require('co-busboy');
const fs = require('fs');
const request = require('co-request');

function *handleFiles(next) {
}

function pipeRequest(readable, requestThunk) {
    console.log('requestThunk');
    console.log(requestThunk);
    return function (cb) {
        readable.pipe(requestThunk(cb));
    }
}
function composeUrl(host, port, path) {
    return 'http://' + host + ':' + port + path;
}
function uploadToBucket(bucket) {
    return function *(next) {
        if (!this.request.is('multipart/*')) return yield next;

        this.body = yield pipeRequest(yield parse(this.request), request({
            uri: composeUrl(config.upload_qiniu.inner.host, config.upload_qiniu.inner.port),
            path: '/upload' + bucket,
            method: 'PUT',
            headers: {
                'Content-Type': 'multipart/form-data; boundary=' + Math.random().toString(16)
            }
        }));
    };
}

module.exports = function (app, router, parse) {
    router
        .put(serviceUrls.buzz.picture.upload.frontEnd, uploadToBucket(serviceUrls.buzz.picture.upload.bucket))
};