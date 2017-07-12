'use strict';

const config = require('../../config');
const buzz = require('../../service-proxy-for-server/buzz');
const course = require('../../bll/course');
const mount = require('koa-mount');
const saas = require('../../bll/saas');
const fs = require('fs');
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

module.exports = function (app, router, render, server) {
    const io = require('socket.io')(server);
    io.on('connection', function (socket) {
        console.log('a user connected');

        socket.on('disconnect', function () {
            console.log('user disconnected');
        });

        socket.on('test', function (msg) {
            console.log('message: ' + msg);
        });

        socket.on('video', function (stream) {
            console.log('video', stream);
        });
    });

    router
        .get('/video', saas.checkSaasReferer, function* () {
            this.body = yield render.call(this, '/m/video', {
                config: config,
                base: saas.getBaseFor(this, '/'),
                title: 'video demo'
            })
        })
        .put('/videos', function* (next) {
            if (!this.request.is('multipart/*')) return yield next

            this.body = yield pipeRequest(this.req, config.serviceUrls.buzz.picture.upload.bucket);
        })
        ;
};
