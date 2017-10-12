'use strict';

const config = require('../../config');
const buzz = require('../../service-proxy-for-server/buzz');
const fs = require('fs');
const request = require('request');
const os = require('os');
const path = require('path');
const parse = require('co-busboy');
const exec = require('child_process').exec;
const stream = require('koa-stream');
const greenSharedLogger = require('../../common/logger')('/routes/more/video.js');
const proxy = require('../../service-proxy/proxy');
const formParser = require('../../common/form-parser');
const photoBll = require('../../bll/photo');

const proxyOption = {
    host: config.hongda.host,
    port: config.hongda.port
};

function yieldableExec(command) {
    return function (cb) {
        exec(command, cb);
    }
}

function pipeRequest(from, bucket) {
    return function (cb) {
        from.pipe(request.put(composeUrl(config.upload_qiniu.inner.host, config.upload_qiniu.inner.port, '/upload' + bucket), {}, function (err, response, body) {
            cb(err, body);
        }));
    };
}

function composeUrl(host, port, path) {
    return 'http://' + host + ':' + port + path;
}

module.exports = function (app, router, render, server) {
    function* renderPhotoSPA() {
        let view = '/photo';
        if (true || this.state.userAgent.isMobile) {
            view = '/m' + view;
        }

        this.body = yield render.call(this, view, {
            config: config,
            base: '/',
            title: 'Upload faces'
        });
    }

    router
        .get('/photo', renderPhotoSPA)
        .get('/photo/:path', renderPhotoSPA)
        .post('/photos', function* (next) {
            let parts = parse(this);
            let part;

            let formData = {};
            let photos = [];
            while ((part = yield parts)) {
                if (part && part.filename) {
                    let photoPath = photoBll.ugcFullPath(part.filename);

                    let stream = fs.createWriteStream(photoPath);
                    part.pipe(stream);

                    console.log('file = ', photoPath);

                    photos.push(photoPath);
                } else {
                    console.log('formData = ', part);
                    formParser.parse(formData, part);
                }
            }

            console.log('photos = ', photos);
            this.body = yield proxy(Object.assign({
                path: '/photo/averager',
                method: 'POST',
                data: {
                    photos: photos
                }
            }, proxyOption));

        })
        .get('/photos/:path', function* (next) {
            let fpath = new Buffer(this.params.path, 'base64').toString();

            try {
                let fstat = fs.statSync(fpath);

                if (fstat.isFile()) {
                    // this.set('Content-disposition', `inline; filename=${path.basename(fpath)}`);
                    // this.set('Content-Transfer-Encoding', 'binary'); this.type = extname(fpath);
                    // this.body = fs.createReadStream(fpath);
                    yield stream.file(this, path.basename(fpath), {
                        root: path.dirname(fpath),
                        allowDownload: true
                    });
                } else {
                    this.body = `${fpath} is not a file or is deleted`;
                }
            } catch (ex) {
                greenSharedLogger.error(`Couldn't handle this file: ${fpath}`);
                this.throw(ex);
            }
        });
};